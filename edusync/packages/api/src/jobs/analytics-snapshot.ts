import { Queue, Worker, Job } from 'bullmq';
import { 
  SwapModel, 
  ResourceModel, 
  AnalyticsSnapshotModel, 
  nexusConnector 
} from '@edusync/db';
import { SYSTEM_ACCOUNTS } from '@edusync/shared';
import { redis } from '../services/redis-service.js';
import { AnalyticsService } from '../modules/analytics/service.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

export const analyticsSnapshotQueue = new Queue('analytics-snapshot', { connection });

export const registerAnalyticsSnapshotJob = async () => {
  await analyticsSnapshotQueue.add('daily-snapshot', {}, {
    repeat: { pattern: '0 0 * * *' },
    removeOnComplete: true
  });
  console.log('📅 Analytics Snapshot Job Registered: daily @ midnight UTC');
};

export const AnalyticsSnapshotWorker = new Worker('analytics-snapshot', async (job: Job) => {
  console.log(`📊 Processing Analytics Snapshot Job: ${job.id}`);
  
  const campuses = ['IIT_JAMMU', 'IIT_DELHI', 'IIT_BOMBAY', 'IIT_KANPUR', 'NIT_TRICHY'];
  
  // Window: Yesterday (Midnight to Midnight UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  for (const campus of campuses) {
    try {
      // 1. Swap Metrics
      const swapAgg = await SwapModel.aggregate([
        { $match: { 
          campusId: campus, 
          createdAt: { $gte: yesterday, $lt: today } 
        }},
        { $group: {
          _id: '$isCrossCampus',
          initiated: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          canceled: { $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] } },
          disputed: { $sum: { $cond: [{ $eq: ['$status', 'disputed'] }, 1, 0] } }
        }}
      ]);

      const swapMetrics = {
        initiated: swapAgg.reduce((acc, curr) => acc + curr.initiated, 0),
        completed: swapAgg.reduce((acc, curr) => acc + curr.completed, 0),
        canceled: swapAgg.reduce((acc, curr) => acc + curr.canceled, 0),
        disputed: swapAgg.reduce((acc, curr) => acc + curr.disputed, 0),
        crossCampus: swapAgg.find(a => a._id === true)?.completed || 0
      };

      // 2. Karma Metrics (PostgreSQL)
      const karmaQuery = `
        SELECT 
          SUM(CASE WHEN sender_uid NOT IN ($2, $3, $4) THEN amount ELSE 0 END) as spent,
          SUM(CASE WHEN receiver_uid NOT IN ($2, $3, $4) THEN amount ELSE 0 END) as earned
        FROM karma_ledger
        WHERE institutional_node = $1
        AND transaction_timestamp >= $5
        AND transaction_timestamp < $6
      `;
      const karmaResult = await nexusConnector.pg.query(karmaQuery, [
        campus, 
        ...SYSTEM_ACCOUNTS, 
        yesterday, 
        today
      ]);
      const { spent, earned } = karmaResult.rows[0];

      // 3. Vault Metrics
      const vaultAgg = await ResourceModel.aggregate([
        { $match: { 
          campusId: campus, 
          createdAt: { $gte: yesterday, $lt: today } 
        }},
        { $group: {
           _id: null,
           uploaded: { $sum: 1 },
           certified: { $sum: { $cond: [{ $eq: ['$verification.status', 'verified'] }, 1, 0] } }
        }}
      ]);

      // 4. Persistence (Upsert for Idempotency)
      await AnalyticsSnapshotModel.findOneAndUpdate(
        { campus, snapshotDate: yesterday },
        { 
          $set: {
            metrics: {
              totalSwapsInitiated: swapMetrics.initiated,
              totalSwapsCompleted: swapMetrics.completed,
              totalSwapsCanceled: swapMetrics.canceled,
              totalSwapsDisputed: swapMetrics.disputed,
              crossCampusSwapsCompleted: swapMetrics.crossCampus,
              totalKarmaEarned: parseFloat(earned || '0'),
              totalKarmaSpent: parseFloat(spent || '0'),
              totalResourcesUploaded: vaultAgg[0]?.uploaded || 0,
              totalResourcesCertified: vaultAgg[0]?.certified || 0,
              karmaCirculationVelocity: spent > 0 ? earned / spent : 1.0
            },
            generatedAt: new Date()
          }
        },
        { upsert: true }
      );

      // 5. Invalidate Cache
      await AnalyticsService.invalidateCache(campus);

    } catch (campusError) {
      console.error(`❌ Analytics Job Error for campus ${campus}:`, campusError);
    }
  }

  return { status: 'completed', date: yesterday.toISOString() };
}, { connection });
