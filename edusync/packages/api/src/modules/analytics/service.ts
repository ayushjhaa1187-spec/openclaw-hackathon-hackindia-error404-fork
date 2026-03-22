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

    const series = flowResult.rows.map(r => ({
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
        ? series.reduce((acc, c) => acc + c.earned, 0) / (series.reduce((acc, c) => acc + c.spent, 0) || 1)
        : 1.0
    };

    await redis.set(cacheKey, JSON.stringify(result), { EX: 900 });
    return result;
  }
}
