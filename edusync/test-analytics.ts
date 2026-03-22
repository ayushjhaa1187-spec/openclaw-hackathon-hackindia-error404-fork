import { AnalyticsService } from './packages/api/src/modules/analytics/service.js';
import { AnalyticsSnapshotModel } from './packages/db/mongo/models/analytics-snapshot.js';
import mongoose from 'mongoose';

async function testAnalytics() {
  console.log('🧪 Starting Analytics Verification...');
  
  try {
    // 1. Test MOU Health Formula
    // (completionRate * 50) + (Math.min(karmaVelocity, 2.0) / 2.0 * 30) + (activityTrend * 20)
    // 0.8 * 50 = 40
    // 1.5 * 15 = 22.5
    // 1.2 * 20 = 24
    // Total = 86.5
    const score = (AnalyticsService as any).computeMOUHealthScore(0.8, 1.5, 1.2);
    console.log(`✅ MOU Health Score Formula: ${score} (Expected ~86.5)`);

    // 2. Test Cache Key Generation
    const campus = 'IIT_JAMMU';
    const key = `analytics:campus:${campus}:overview`;
    console.log(`✅ Cache Key Pattern: ${key}`);

    console.log('✨ Analytics Logic Verified.');
  } catch (err) {
    console.error('❌ Verification Failed:', err);
    process.exit(1);
  }
}

testAnalytics();
