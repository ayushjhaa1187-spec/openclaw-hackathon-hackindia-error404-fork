import { 
  ResourceModel, 
  nexusConnector, 
  AnalyticsSnapshotModel,
  NotificationModel 
} from '@edusync/db';
import { SYSTEM_ACCOUNTS } from '@edusync/shared';
// Assuming redis is available via a global or shared utility. 
// I'll check packages/api/src/server.ts or similar for redis setup.
import { redis } from '../../services/redis-service.js'; 

export class AnalyticsService {
  /**
   * Option C: Hybrid Redis Cache Invalidation
   * Uses SCAN for redis v4 compatibility
   */
  static async invalidateCache(campus: string): Promise<void> {
    const pattern = `analytics:campus:${campus}:*`;
    let cursor = 0;
    try {
      do {
        // @ts-ignore - redis v4 scan signature
        const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = Number(result.cursor);
        if (result.keys.length > 0) {
          await redis.del(result.keys);
        }
      } while (cursor !== 0);
      console.log(`✅ Analytics Cache Purged: ${pattern}`);
    } catch (error) {
      console.error('❌ Redis Cache Invalidation Error:', error);
    }
  }

  static async getOverview(campus: string) {
    const cacheKey = `analytics:campus:${campus}:overview`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Compute fresh
    const [
      totalStudents,
      nexusEnabled,
      certifiedResources,
      totalResources
    ] = await Promise.all([
      // Assuming StudentModel is available (might need to check core models)
      nexusConnector.mongo.models.Student.countDocuments({ campus }),
      nexusConnector.mongo.models.Student.countDocuments({ campus, 'nexus.crossCampusEnabled': true }),
      ResourceModel.countDocuments({ campusId: campus, 'verification.status': 'verified' }),
      ResourceModel.countDocuments({ campusId: campus })
    ]);

    // Karma in circulation (PostgreSQL)
    const ledgerQuery = `
      SELECT SUM(amount) as total 
      FROM karma_ledger 
      WHERE institutional_node = $1
      AND sender_uid NOT IN ($2, $3)
      AND receiver_uid NOT IN ($2, $3)
    `;
    const ledgerResult = await nexusConnector.pg.query(ledgerQuery, [campus, ...SYSTEM_ACCOUNTS]);
    const totalKarmaCirculating = parseFloat(ledgerResult.rows[0]?.total || '0');

    // Active MOUs
    const mouQuery = `SELECT COUNT(*) as count FROM mou_handshake_log WHERE is_active = true`;
    const mouResult = await nexusConnector.pg.query(mouQuery);
    const activeMOUCount = parseInt(mouResult.rows[0]?.count || '0');

    const overview = {
      totalStudents,
      nexusEnabledStudents: nexusEnabled,
      totalResourcesCertified: certifiedResources,
      totalResourcesUploaded: totalResources,
      totalKarmaCirculating,
      activeMOUCount,
      generatedAt: new Date()
    };

    await redis.set(cacheKey, JSON.stringify(overview), { EX: 900 }); // 15 min
    return overview;
  }

  /**
   * MOU Health Score formula:
   * (completion_rate * 50) + (Math.min(karmaVelocity, 2.0) / 2.0 * 30) + (activityTrend * 20)
   */
  static computeMOUHealthScore(completionRate: number, karmaVelocity: number, activityTrend: number): number {
    return Math.round(
      (completionRate * 50) +
      (Math.min(karmaVelocity, 2.0) / 2.0 * 30) +
      (activityTrend * 20)
    );
  }

  static async getSwapTrend(campus: string, range: '7d' | '30d' | '90d' = '30d') {
    const cacheKey = `analytics:campus:${campus}:swaps:${range}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    // Fetch from snapshots
    const snapshots = await AnalyticsSnapshotModel.find({
      campus,
      snapshotDate: { $gte: startDate }
    }).sort({ snapshotDate: 1 });

    // Gap fill or direct query logic for missing days
    const trend = snapshots.map(s => ({
      date: s.snapshotDate,
      initiated: s.metrics.totalSwapsInitiated,
      completed: s.metrics.totalSwapsCompleted,
      crossCampus: s.metrics.crossCampusSwapsCompleted
    }));

    await redis.set(cacheKey, JSON.stringify(trend), { EX: 900 });
    return trend;
  }

  static async getVaultMetrics(campus: string, range: '7d' | '30d' | '90d' = '30d') {
    const cacheKey = `analytics:campus:${campus}:vault:${range}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);

    const snapshots = await AnalyticsSnapshotModel.find({
      campus,
      snapshotDate: { $gte: startDate }
    }).sort({ snapshotDate: 1 });

    const series = snapshots.map(s => ({
      date: s.snapshotDate,
      uploaded: s.metrics.totalResourcesUploaded,
      certified: s.metrics.totalResourcesCertified
    }));

    // Most downloaded resource in period (Direct MongoDB)
    const topResource = await ResourceModel.findOne({ campusId: campus })
      .sort({ downloads: -1 })
      .limit(1);

    const result = {
      series,
      topResource: topResource ? {
        id: topResource._id,
        title: topResource.title,
        downloads: topResource.downloads
      } : null
    };

    await redis.set(cacheKey, JSON.stringify(result), { EX: 900 });
    return result;
  }

  static async getKarmaFlow(campus: string, range: '7d' | '30d' | '90d' = '30d') {
    const cacheKey = `analytics:campus:${campus}:karma:${range}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);

    // PostgreSQL aggregation for peer-to-peer flow
    const flowQuery = `
      SELECT 
        DATE(transaction_timestamp) as date,
        SUM(CASE WHEN receiver_uid NOT IN ($2, $3, $4) THEN amount ELSE 0 END) as earned,
        SUM(CASE WHEN sender_uid NOT IN ($2, $3, $4) THEN amount ELSE 0 END) as spent
      FROM karma_ledger
      WHERE institutional_node = $1
      AND transaction_timestamp >= $5
      GROUP BY DATE(transaction_timestamp)
      ORDER BY date ASC
    `;
    const flowResult = await nexusConnector.pg.query(flowQuery, [
      campus, 
      ...SYSTEM_ACCOUNTS, 
      startDate
    ]);

    const series = flowResult.rows.map((r: any) => ({
      date: r.date,
      earned: parseFloat(r.earned || '0'),
      spent: parseFloat(r.spent || '0')
    }));

    // Top earners in period
    const topEarnersQuery = `
      SELECT receiver_uid, SUM(amount) as total
      FROM karma_ledger
      WHERE institutional_node = $1
      AND receiver_uid NOT IN ($2, $3, $4)
      AND transaction_timestamp >= $5
      GROUP BY receiver_uid
      ORDER BY total DESC
      LIMIT 5
    `;
    const topEarnersResult = await nexusConnector.pg.query(topEarnersQuery, [
      campus, 
      ...SYSTEM_ACCOUNTS, 
      startDate
    ]);

    const result = {
      series,
      topEarners: topEarnersResult.rows,
      velocity: series.length > 0 
        ? series.reduce((acc: number, c: any) => acc + c.earned, 0) / (series.reduce((acc: number, c: any) => acc + c.spent, 0) || 1)
        : 1.0
    };

    await redis.set(cacheKey, JSON.stringify(result), { EX: 900 });
    return result;
  }

  /**
   * Fetches utilization metrics for a specific campus pair (MOU).
   * Aggregates from nexus_transparency_log and karma_ledger.
   */
  static async getMOUUtilization(adminCampus: string, partnerCampus: string, range: '7d' | '30d' | '90d' = '90d') {
    const cacheKey = `analytics:mou:${adminCampus}:${partnerCampus}:${range}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);

    // 1. Swap Trend for this pair
    const swapQuery = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(CASE WHEN action = 'swap_requested' THEN 1 END) as initiated,
        COUNT(CASE WHEN action = 'swap_completed' THEN 1 END) as completed
      FROM nexus_transparency_log
      WHERE ((requester_campus_id = $1 AND responder_campus_id = $2)
         OR (requester_campus_id = $2 AND responder_campus_id = $1))
      AND timestamp >= $3
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;
    const swapResult = await nexusConnector.pg.query(swapQuery, [adminCampus, partnerCampus, startDate]);

    // 2. Karma Flow for this pair
    const karmaQuery = `
      SELECT 
        DATE(transaction_timestamp) as date,
        SUM(amount) as total
      FROM karma_ledger
      WHERE ((sender_uid IN (SELECT firebase_uid FROM students WHERE campus = $1) AND receiver_uid IN (SELECT firebase_uid FROM students WHERE campus = $2))
         OR (sender_uid IN (SELECT firebase_uid FROM students WHERE campus = $2) AND receiver_uid IN (SELECT firebase_uid FROM students WHERE campus = $1)))
      AND transaction_timestamp >= $3
      AND sender_uid NOT IN ($4, $5)
      AND receiver_uid NOT IN ($4, $5)
      GROUP BY DATE(transaction_timestamp)
    `;
    // Note: The subquery above assumes a 'students' table in Postgres, but EduSync uses Mongo for students.
    // However, karma_ledger HAS institutional_node. We can use that if it maps to the other campus.
    // Actually, Session 14 prompt says "karma_ledger has institutional_node column populated".
    // But institutional_node is for the node where transaction occurred. 
    // We need to know the SENDER's campus and RECEIVER's campus.
    // Let's use nexus_transparency_log to find swap_ids for this pair, then find karma transactions for those swap_ids.
    // That's more accurate for MOU ROI.
    
    const karmaPairQuery = `
      SELECT SUM(amount) as total
      FROM karma_ledger
      WHERE transaction_reason LIKE 'Swap Completion:%'
      AND sender_uid NOT IN ($4, $5)
      AND receiver_uid NOT IN ($4, $5)
      AND transaction_reason IN (
        SELECT 'Swap Completion: ' || swap_id FROM nexus_transparency_log
        WHERE ((requester_campus_id = $1 AND responder_campus_id = $2)
           OR (requester_campus_id = $2 AND responder_campus_id = $1))
        AND action = 'swap_completed'
        AND timestamp >= $3
      )
    `;
    const karmaResult = await nexusConnector.pg.query(karmaPairQuery, [adminCampus, partnerCampus, startDate, ...SYSTEM_ACCOUNTS]);
    const totalKarmaExchanged = parseFloat(karmaResult.rows[0]?.total || '0');

    const swapTrend = swapResult.rows.map((r: any) => ({
      date: r.date,
      initiated: parseInt(r.initiated || '0'),
      completed: parseInt(r.completed || '0')
    }));

    const totalCompleted = swapTrend.reduce((acc: number, curr: any) => acc + curr.completed, 0);
    const totalInitiated = swapTrend.reduce((acc: number, curr: any) => acc + curr.initiated, 0);
    const completionRate = totalInitiated > 0 ? totalCompleted / totalInitiated : 1.0;

    // Karma Velocity proxy for this pair (scaled relative to others)
    const karmaVelocity = totalKarmaExchanged / (totalCompleted || 1) / 100; // Normalized

    const utilization = {
      swapTrend,
      totalKarmaExchanged,
      completionRate,
      mouHealthScore: this.computeMOUHealthScore(completionRate, karmaVelocity, 1.0), // Baseline trend 1.0
      generatedAt: new Date()
    };

    await redis.set(cacheKey, JSON.stringify(utilization), { EX: 600 });
    return utilization;
  }

  /**
   * Aggregates health metrics for all active MOUs for a campus.
   */
  static async getMOUHealthDashboard(adminCampus: string) {
    const cacheKey = `analytics:mou-dashboard:${adminCampus}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 1. Fetch active MOUs
    const mouQuery = `
      SELECT * FROM mou_handshake_log 
      WHERE (initiating_campus = $1 OR accepting_campus = $1)
      AND "isActive" = true
    `;
    const mouResult = await nexusConnector.pg.query(mouQuery, [adminCampus]);
    const activeMOUs = mouResult.rows;

    // 2. Fetch aggregate data from transparency log
    const aggregateQuery = `
      SELECT 
        COUNT(*) as total_swaps,
        SUM(CASE WHEN timestamp >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as swaps_30d
      FROM nexus_transparency_log
      WHERE (requester_campus_id = $1 OR responder_campus_id = $1)
      AND action = 'swap_completed'
    `;
    const aggResult = await nexusConnector.pg.query(aggregateQuery, [adminCampus]);
    const totalCrossSwapsAllTime = parseInt(aggResult.rows[0]?.total_swaps || '0');
    const swapsLast30Days = parseInt(aggResult.rows[0]?.swaps_30d || '0');

    // 3. Pending & Expired counts
    const statusQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'pending' AND accepting_campus = $1 THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired
      FROM mou_handshake_log
      WHERE initiating_campus = $1 OR accepting_campus = $1
    `;
    const statusResult = await nexusConnector.pg.query(statusQuery, [adminCampus]);
    const totalPendingProposals = parseInt(statusResult.rows[0]?.pending || '0');
    const totalExpiredMOUs = parseInt(statusResult.rows[0]?.expired || '0');

    // 4. Karma exchanged across all MOUs
    // (Existing karma query remains...)
    const karmaSumQuery = `
      SELECT SUM(amount) as total
      FROM karma_ledger
      WHERE institutional_node = $1
      AND transaction_reason LIKE 'Swap Completion:%'
      AND transaction_reason IN (
        SELECT 'Swap Completion: ' || swap_id FROM nexus_transparency_log
        WHERE requester_campus_id != responder_campus_id
      )
    `;
    const karmaSumResult = await nexusConnector.pg.query(karmaSumQuery, [adminCampus]);
    const totalKarmaExchangedAllTime = parseFloat(karmaSumResult.rows[0]?.total || '0');

    // 5. Most Active Partner
    const partnerQuery = `
      SELECT 
        CASE WHEN requester_campus_id = $1 THEN responder_campus_id ELSE requester_campus_id END as partner,
        COUNT(*) as count
      FROM nexus_transparency_log
      WHERE (requester_campus_id = $1 OR responder_campus_id = $1)
      AND action = 'swap_completed'
      GROUP BY partner
      ORDER BY count DESC
      LIMIT 1
    `;
    const partnerResult = await nexusConnector.pg.query(partnerQuery, [adminCampus]);
    const mostActiveMOUPartner = partnerResult.rows[0]?.partner || null;

    // 6. Calculate average health score
    let totalHealthScore = 0;
    for (const mou of activeMOUs) {
      const partner = mou.initiating_campus === adminCampus ? mou.accepting_campus : mou.initiating_campus;
      const util = await this.getMOUUtilization(adminCampus, partner, '30d');
      totalHealthScore += util.mouHealthScore;
    }
    const averageMOUHealthScore = activeMOUs.length > 0 ? Math.round(totalHealthScore / activeMOUs.length) : 0;

    const dashboard = {
      totalActiveMOUs: activeMOUs.length,
      totalExpiredMOUs,
      totalPendingProposals,
      totalCrossSwapsAllTime,
      totalKarmaExchangedAllTime,
      averageMOUHealthScore,
      swapsLast30Days,
      mostActiveMOUPartner
    };

    await redis.set(cacheKey, JSON.stringify(dashboard), { EX: 900 });
    return dashboard;
  }

  /**
   * Aggregates metrics for an entire college group.
   */
  static async getGroupOverview(collegeGroupId: string) {
    const cacheKey = `analytics:group:${collegeGroupId}:overview`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 1. Find all campuses in this group
    const campuses = await nexusConnector.mongo.models.Student.distinct('campus', { collegeGroupId });

    // 2. Aggregate metrics across campuses
    const overviews = await Promise.all(campuses.map(c => this.getOverview(c)));

    const groupOverview = {
      collegeGroupId,
      campusCount: campuses.length,
      campuses,
      aggregate: {
        totalStudents: overviews.reduce((acc, curr) => acc + curr.totalStudents, 0),
        nexusEnabledStudents: overviews.reduce((acc, curr) => acc + curr.nexusEnabledStudents, 0),
        totalResourcesCertified: overviews.reduce((acc, curr) => acc + curr.totalResourcesCertified, 0),
        totalResourcesUploaded: overviews.reduce((acc, curr) => acc + curr.totalResourcesUploaded, 0),
        totalKarmaCirculating: overviews.reduce((acc, curr) => acc + curr.totalKarmaCirculating, 0),
        activeMOUCount: overviews.reduce((acc, curr) => acc + curr.activeMOUCount, 0),
      },
      generatedAt: new Date()
    };

    await redis.set(cacheKey, JSON.stringify(groupOverview), { EX: 1800 }); // 30 min
    return groupOverview;
  }
}
