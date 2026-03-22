import { StudentModel, SwapModel, nexusConnector } from '@edusync/db';
import { LeaderboardService } from '../leaderboard/service.js';

export class NexusService {
  /**
   * Fetches a student profile from a partner institutional node.
   * Includes MOU metadata and prior interaction history from the transparency log.
   */
  static async getCrossCampusProfile(targetUid: string, requestingStudent: any, activeMOU: any) {
    // 1. Fetch target student
    const target = await StudentModel.findOne({ firebaseUid: targetUid }).lean();
    if (!target) throw new Error('STUDENT_NOT_FOUND');

    // 2. Safety check: Target must belong to the MOU's campuses
    const authorizedCampuses = [activeMOU.initiating_campus, activeMOU.accepting_campus];
    if (!authorizedCampuses.includes(target.campus)) {
      throw new Error('CAMPUS_MISMATCH');
    }

    // 3. Fetch interaction history from Transparency Log (Postgres)
    const logQuery = `
      SELECT action, timestamp, metadata
      FROM nexus_transparency_log
      WHERE (
        (requester_id = $1 AND responder_id = $2) OR
        (requester_id = $2 AND responder_id = $1)
      )
      ORDER BY timestamp DESC
      LIMIT 5
    `;
    const logs = await nexusConnector.pg.query(logQuery, [requestingStudent.uid, targetUid]);

    // 4. Fetch Cross-campus Swaps Completed (Mongo)
    const swapsCompleted = await SwapModel.countDocuments({
      $or: [
        { requesterUid: requestingStudent.uid, providerUid: targetUid },
        { requesterUid: targetUid, providerUid: requestingStudent.uid }
      ],
      status: 'completed',
      isCrossCampus: true
    });

    // 5. Fetch Global Rank (Redis/Leaderboard)
    const rankData = await LeaderboardService.getStudentRank(targetUid, target.campus);

    return {
      profile: {
        uid: target.firebaseUid,
        name: target.name,
        avatarUrl: target.avatarUrl,
        campus: target.campus,
        department: target.department,
        year: target.year,
        specialization: target.specialization,
        skills: target.skills,
        wantToLearn: target.wantToLearn,
        karma: target.karma,
        reputationScore: target.reputationScore,
        rankTier: target.rankTier || 'bronze',
      },
      nexusMeta: {
        mouId: activeMOU.id,
        mouValidUntil: activeMOU.validUntil,
        mouAgreementTerms: activeMOU.terms,
        priorCollaborationCount: logs.rowCount,
        hasCollaboratedBefore: logs.rowCount > 0,
        crossCampusSwapsCompleted: swapsCompleted,
        interactions: logs.rows
      },
      globalRank: {
        rank: rankData.rank,
        totalStudents: rankData.totalStudents,
        tier: rankData.tier
      }
    };
  }

  /**
   * Explores students on partner institutional nodes with active MOUs.
   */
  static async getCrossCampusExplore(requestingStudent: any, query: string = '', limit: number = 20, cursor?: string) {
    // 1. Identify accessible partner campuses
    const partnersQuery = `
      SELECT initiating_campus, accepting_campus, id as mou_id
      FROM mou_handshake_log
      WHERE (initiating_campus = $1 OR accepting_campus = $1)
      AND "isActive" = true
      AND (valid_until IS NULL OR valid_until > NOW())
    `;
    const partners = await nexusConnector.pg.query(partnersQuery, [requestingStudent.campus]);
    
    const partnerCampusCodes = partners.rows.map((row: any) => 
      row.initiating_campus === requestingStudent.campus ? row.accepting_campus : row.initiating_campus
    );

    if (partnerCampusCodes.length === 0) {
      return { students: [], message: 'No active MOU partners found' };
    }

    // 2. Search MongoDB for students on accessible campuses
    const mongoQuery: any = {
      campus: { $in: partnerCampusCodes },
      'nexus.crossCampusEnabled': true,
      firebaseUid: { $ne: requestingStudent.uid }
    };

    if (query) {
      mongoQuery.$or = [
        { skills: { $regex: query, $options: 'i' } },
        { specialization: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } }
      ];
    }

    if (cursor) {
      mongoQuery._id = { $lt: cursor };
    }

    const students = await StudentModel.find(mongoQuery)
      .sort({ karma: -1, reputationScore: -1, _id: -1 })
      .limit(limit)
      .lean();

    // Map MOU IDs for each student
    const campusToMouMap = new Map();
    partners.rows.forEach((r: any) => {
      const partner = r.initiating_campus === requestingStudent.campus ? r.accepting_campus : r.initiating_campus;
      campusToMouMap.set(partner, r.mou_id);
    });

    const results = students.map(s => ({
      uid: s.firebaseUid,
      name: s.name,
      avatarUrl: s.avatarUrl,
      campus: s.campus,
      specialization: s.specialization,
      department: s.department,
      skills: s.skills.slice(0, 3), // Preview skills
      rankTier: s.rankTier || 'bronze',
      karma: s.karma,
      mouId: campusToMouMap.get(s.campus)
    }));

    return {
      students: results,
      nextCursor: students.length === limit ? students[students.length - 1]._id : null,
      accessibleCampuses: partnerCampusCodes
    };
  }

  /**
   * Fetches the current list of MOU-connected campus partner profiles.
   */
  static async getActiveMOUPartners(requestingStudent: any) {
    const partnersQuery = `
      SELECT 
        id as mou_id, 
        initiating_campus, 
        accepting_campus, 
        agreement_terms, 
        valid_from, 
        valid_until
      FROM mou_handshake_log
      WHERE (initiating_campus = $1 OR accepting_campus = $1)
      AND "isActive" = true
      AND (valid_until IS NULL OR valid_until > NOW())
    `;
    const res = await nexusConnector.pg.query(partnersQuery, [requestingStudent.campus]);

    const partners = res.rows.map((row: any) => ({
      mouId: row.mou_id,
      partnerCampus: row.initiating_campus === requestingStudent.campus ? row.accepting_campus : row.initiating_campus,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      termsSummary: row.agreement_terms?.substring(0, 100) + '...'
    }));

    return { partners };
  }
}
