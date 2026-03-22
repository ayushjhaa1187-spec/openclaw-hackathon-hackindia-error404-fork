import { nexusConnector, SwapModel, StudentModel } from '@edusync/db';
import { redis } from '../../services/redis-service.js';
import { AnalyticsService } from '../analytics/service.js';
import { NotificationService } from '../notifications/service.js';
import { SwapService } from '../swap/service.js';
import { getIO } from '../../socket.js';

export class MOUService {
  static async proposeMOU(initiatingCampus: string, acceptingCampus: string, adminUid: string, data: any) {
    if (initiatingCampus === acceptingCampus) throw new Error('CANNOT_PROPOSE_MOU_TO_SELF');

    const mouReferenceNumber = `MOU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const query = `
      INSERT INTO mou_handshake_log (
        initiating_campus, 
        accepting_campus, 
        agreement_terms, 
        valid_until, 
        mou_reference_number, 
        credit_exchange_rate, 
        max_cross_connections, 
        data_share_level, 
        proposed_by, 
        status, 
        "isActive"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', false)
      RETURNING *
    `;

    const values = [
      initiatingCampus,
      acceptingCampus,
      data.agreementTerms || 'Standard EduSync Nexus MOU v2.0',
      data.validUntil || null,
      mouReferenceNumber,
      data.creditExchangeRate || 1.0,
      data.maxCrossConnections || 100,
      data.dataShareLevel || 'profiles_only',
      adminUid
    ];

    const result = await nexusConnector.pg.query(query, values);
    const mou = result.rows[0];

    // Invalidate local cache
    await redis.del(`mou:list:${initiatingCampus}`);
    await redis.del(`mou:list:${acceptingCampus}`);

    // Real-time notify receiving campus admins
    const io = getIO();
    io.to(`admin:${acceptingCampus}`).emit('mou:proposal_received', { 
      mouId: mou.id, 
      from: initiatingCampus 
    });

    return mou;
  }

  static async getMOUList(adminCampus: string) {
    const cacheKey = `mou:list:${adminCampus}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const query = `
      SELECT * FROM mou_handshake_log
      WHERE initiating_campus = $1 OR accepting_campus = $1
      ORDER BY "isActive" DESC, valid_until ASC NULLS LAST
    `;
    const result = await nexusConnector.pg.query(query, [adminCampus]);
    const health = await AnalyticsService.getMOUHealthDashboard(adminCampus);

    const mous = await Promise.all(result.rows.map(async (row: any) => {
      const partnerCampus = row.initiating_campus === adminCampus ? row.accepting_campus : row.initiating_campus;
      const now = new Date();
      const validUntil = row.valid_until ? new Date(row.valid_until) : null;
      
      let expiryStatus = 'active';
      let daysUntilExpiry = null;

      if (validUntil) {
        daysUntilExpiry = Math.floor((validUntil.getTime() - now.getTime()) / 86400000);
        if (daysUntilExpiry < 0) expiryStatus = 'expired';
        else if (daysUntilExpiry <= 30) expiryStatus = 'expiring_soon';
      } else {
        expiryStatus = 'ongoing';
      }

      const metrics = await AnalyticsService.getMOUUtilization(adminCampus, partnerCampus, '30d');
      const activeNexusStudents = await StudentModel.countDocuments({ 
        campus: partnerCampus, 
        'nexus.crossCampusEnabled': true 
      });

      return {
        mouId: row.id,
        referenceNumber: row.mou_reference_number,
        partnerCampus,
        status: row.status,
        isActive: row.isActive,
        validFrom: row.valid_from,
        validUntil: row.valid_until,
        daysUntilExpiry,
        expiryStatus,
        creditExchangeRate: row.credit_exchange_rate,
        maxCrossConnections: row.max_cross_connections,
        dataShareLevel: row.data_share_level,
        terms: row.agreement_terms,
        metrics: {
          ...metrics,
          activeNexusStudents
        }
      };
    }));

    const response = { mous, health };
    await redis.set(cacheKey, JSON.stringify(response), { EX: 900 });
    return response;
  }

  static async getMOUDetail(mouId: string, adminCampus: string) {
    const cacheKey = `mou:detail:${mouId}:${adminCampus}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const query = `SELECT * FROM mou_handshake_log WHERE id = $1`;
    const result = await nexusConnector.pg.query(query, [mouId]);
    const mou = result.rows[0];

    if (!mou) throw new Error('MOU_NOT_FOUND');
    if (mou.initiating_campus !== adminCampus && mou.accepting_campus !== adminCampus) {
      throw new Error('UNAUTHORIZED_MOU_ACCESS');
    }

    const partnerCampus = mou.initiating_campus === adminCampus ? mou.accepting_campus : mou.initiating_campus;
    const utilization = await AnalyticsService.getMOUUtilization(adminCampus, partnerCampus, '90d');

    // Recent transparency log entries
    const logQuery = `
      SELECT * FROM nexus_transparency_log
      WHERE ((requester_campus_id = $1 AND responder_campus_id = $2)
         OR (requester_campus_id = $2 AND responder_campus_id = $1))
      ORDER BY timestamp DESC LIMIT 20
    `;
    const logs = await nexusConnector.pg.query(logQuery, [adminCampus, partnerCampus]);

    // Top collaborators
    const topCollab = await SwapModel.aggregate([
      { $match: { isCrossCampus: true, 'nexusLog.mouId': mouId, status: 'completed' } },
      { $group: { _id: '$requesterUid', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Perspective framing (Symmetric access decision)
    const perspective = {
      initiatorLabel: adminCampus === mou.initiating_campus ? 'Your campus' : mou.initiating_campus,
      receiverLabel: adminCampus === mou.accepting_campus ? 'Your campus' : mou.accepting_campus,
      partnerLabel: adminCampus === mou.initiating_campus ? mou.accepting_campus : mou.initiating_campus
    };

    const detail = {
      mou,
      utilization,
      recentActivity: logs.rows,
      topCollaborators: topCollab,
      perspective
    };

    await redis.set(cacheKey, JSON.stringify(detail), { EX: 600 });
    return detail;
  }

  static async acceptMOUProposal(mouId: string, adminUid: string, adminCampus: string) {
    const query = `
      UPDATE mou_handshake_log 
      SET status = 'active', "isActive" = true, accepted_by = $1
      WHERE id = $2 AND accepting_campus = $3 AND status = 'pending'
      RETURNING *
    `;
    const result = await nexusConnector.pg.query(query, [adminUid, mouId, adminCampus]);
    const updated = result.rows[0];

    if (!updated) throw new Error('PROPOSAL_NOT_FOUND_OR_UNAUTHORIZED');

    // Invalidate caches
    await AnalyticsService.invalidateCache(adminCampus);
    await AnalyticsService.invalidateCache(updated.initiating_campus);
    await redis.del(`mou:list:${adminCampus}`);
    await redis.del(`mou:list:${updated.initiating_campus}`);

    // Audit log
    await nexusConnector.pg.query(`
      INSERT INTO admin_actions (admin_uid, campus, action_type, target_type, target_id, reason)
      VALUES ($1, $2, 'mou_accepted', 'MOU', $3, 'Institutional partnership accepted')
    `, [adminUid, adminCampus, mouId]);

    // Real-time notify initiator
    const io = getIO();
    io.to(`admin:${updated.initiating_campus}`).emit('mou:proposal_accepted', { 
      mouId: updated.id,
      campus: adminCampus 
    });

    return updated;
  }

  static async suspendMOU(mouId: string, adminUid: string, adminCampus: string, reason: string) {
    const query = `
      UPDATE mou_handshake_log 
      SET status = 'suspended', "isActive" = false
      WHERE id = $1 AND (initiating_campus = $2 OR accepting_campus = $2)
      RETURNING *
    `;
    const result = await nexusConnector.pg.query(query, [mouId, adminCampus]);
    const updated = result.rows[0];

    if (!updated) throw new Error('MOU_NOT_FOUND_OR_UNAUTHORIZED');

    // Side effect: Cancel pending cross-campus swaps for this MOU
    const partnerCampus = updated.initiating_campus === adminCampus ? updated.accepting_campus : updated.initiating_campus;
    const pendingSwaps = await SwapModel.find({
      status: 'pending',
      isCrossCampus: true,
      'nexusLog.mouId': mouId
    });

    for (const swap of pendingSwaps) {
      await SwapService.adminOverrideSwap(swap._id.toString(), 'force_refund', adminUid, 'Partnership suspended by administration');
    }

    // Audit log
    await nexusConnector.pg.query(`
      INSERT INTO admin_actions (admin_uid, campus, action_type, target_type, target_id, reason)
      VALUES ($1, $2, 'mou_suspended', 'MOU', $3, $4)
    `, [adminUid, adminCampus, mouId, reason]);

    // Invalidate caches
    await redis.del(`mou:list:${adminCampus}`);
    await redis.del(`mou:list:${partnerCampus}`);
    await redis.del(`mou:detail:${mouId}:${adminCampus}`);
    await redis.del(`mou:detail:${mouId}:${partnerCampus}`);

    // Real-time notify partner
    const io = getIO();
    io.to(`admin:${adminCampus}`).emit('mou:suspended', { mouId });
    io.to(`admin:${partnerCampus}`).emit('mou:suspended', { mouId });

    return updated;
  }

  static async renewMOU(mouId: string, adminUid: string, adminCampus: string, newExpiryDate: string) {
    const currentMOU = await nexusConnector.pg.query(`SELECT valid_until FROM mou_handshake_log WHERE id = $1`, [mouId]);
    if (!currentMOU.rows[0]) throw new Error('MOU_NOT_FOUND');

    const expiry = new Date(newExpiryDate);
    const currentExpiry = currentMOU.rows[0].valid_until ? new Date(currentMOU.rows[0].valid_until) : new Date(0);

    if (expiry <= currentExpiry) throw new Error('NEW_EXPIRY_MUST_BE_AFTER_CURRENT');
    if (expiry <= new Date()) throw new Error('EXPIRY_MUST_BE_FUTURE');

    const query = `
      UPDATE mou_handshake_log 
      SET valid_until = $1, status = 'active', "isActive" = true
      WHERE id = $2 AND (initiating_campus = $3 OR accepting_campus = $3)
      RETURNING *
    `;
    const result = await nexusConnector.pg.query(query, [expiry, mouId, adminCampus]);
    const updated = result.rows[0];

    if (!updated) throw new Error('MOU_NOT_FOUND_OR_UNAUTHORIZED');

    // Audit log
    await nexusConnector.pg.query(`
      INSERT INTO admin_actions (admin_uid, campus, action_type, target_type, target_id, reason)
      VALUES ($1, $2, 'mou_renewed', 'MOU', $3, 'Partnership expiry extended')
    `, [adminUid, adminCampus, mouId]);

    await redis.del(`mou:list:${adminCampus}`);
    await redis.del(`mou:detail:${mouId}:${adminCampus}`);

    return updated;
  }

  static async getTransparencyLog(adminCampus: string, partnerCampus: string, cursor: string, limit: number = 20) {
    let query = `
      SELECT * FROM nexus_transparency_log
      WHERE ((requester_campus_id = $1 AND responder_campus_id = $2)
         OR (requester_campus_id = $2 AND responder_campus_id = $1))
    `;
    const params: any[] = [adminCampus, partnerCampus];

    if (cursor) {
      query += ` AND id < $3`;
      params.push(cursor);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await nexusConnector.pg.query(query, params);
    const entries = result.rows;
    const nextCursor = entries.length === limit ? entries[entries.length - 1].id : null;

    return { entries, nextCursor };
  }
}
