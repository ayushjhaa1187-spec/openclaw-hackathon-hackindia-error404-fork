import { redis } from '../../services/redis-service.js';
import { StudentModel } from '@edusync/db';
import { LeaderboardStudent, KARMA_TIERS } from '@edusync/shared';

export class LeaderboardService {
  /**
   * Fetches the campus-specific leaderboard.
   * Reads from Redis Sorted Set (ZREVRANGE) for sub-5ms performance.
   */
  static async getCampusLeaderboard(campus: string, limit: number = 50) {
    const redisKey = `leaderboard:campus:${campus}`;
    
    // 1. Try Redis First (N+1 Guard: member is JSON)
    const rawData = await redis.zRangeWithScores(redisKey, 0, limit - 1, { REV: true });
    
    if (rawData.length === 0) {
      console.log(`❄️ Redis Miss: Cold start fallback for ${campus} leaderboard.`);
      return this.fallbackToMongo(campus, limit);
    }

    const students: LeaderboardStudent[] = rawData.map(item => JSON.parse(item.value));
    const lastComputed = await redis.get('leaderboard:last_computed');

    return { 
      students, 
      lastComputed: lastComputed ? new Date(lastComputed) : new Date() 
    };
  }

  /**
   * Fetches the global Nexus top 100.
   */
  static async getGlobalLeaderboard(limit: number = 100) {
    const redisKey = 'leaderboard:global';
    const rawData = await redis.zRangeWithScores(redisKey, 0, limit - 1, { REV: true });

    if (rawData.length === 0) {
      return { students: [], lastComputed: new Date() };
    }

    const students: LeaderboardStudent[] = rawData.map(item => JSON.parse(item.value));
    const lastComputed = await redis.get('leaderboard:last_computed');

    return { students, lastComputed: lastComputed ? new Date(lastComputed) : new Date() };
  }

  /**
   * Fetches a specific student's rank and tier progress.
   */
  static async getStudentRank(uid: string, campus: string) {
    const redisKey = `leaderboard:campus:${campus}`;
    
    // ZREVRANK is 0-based index in reverse sorted order
    const rawRank = await redis.zRevRank(redisKey, uid); // This might fail if the member is JSON string
    // Wait, the Redis member is the FULL JSON string. zRevRank won't find it by UID.
    // DESIGN CORRECTION: I need to fetch the student doc to find their rankTier and karmaRank 
    // from the last compute cycle in MongoDB OR iterate the Redis set (expensive).
    
    // I'll use the MongoDB cached fields since the job updates them every 5 mins.
    const student = await StudentModel.findOne({ firebaseUid: uid }, {
      karma: 1, karmaRank: 1, rankTier: 1, campus: 1
    }).lean();

    if (!student) throw new Error('Student not found');

    const totalStudents = await redis.zCard(redisKey);
    
    // Calculate progress to next tier
    const currentTier = student.rankTier as keyof typeof KARMA_TIERS;
    let nextTier: keyof typeof KARMA_TIERS | null = null;
    if (currentTier === 'bronze') nextTier = 'silver';
    else if (currentTier === 'silver') nextTier = 'gold';
    else if (currentTier === 'gold') nextTier = 'platinum';

    let karmaToNextTier = 0;
    if (nextTier) {
      karmaToNextTier = Math.max(0, KARMA_TIERS[nextTier].min - student.karma);
    }

    return {
      rank: student.karmaRank,
      totalStudents: totalStudents || 0,
      tier: student.rankTier,
      karma: student.karma,
      karmaToNextTier,
      campus: student.campus
    };
  }

  private static async fallbackToMongo(campus: string, limit: number) {
    const students = await StudentModel.find({ campus })
      .sort({ karma: -1, reputationScore: -1 })
      .limit(limit)
      .lean();

    const formatted: LeaderboardStudent[] = students.map((s, i) => ({
      uid: s.firebaseUid,
      name: s.name,
      avatarUrl: s.avatarUrl || '',
      campus: s.campus,
      rankTier: (s.rankTier || 'bronze') as any,
      karma: s.karma,
      karmaRank: s.karmaRank || (i + 1),
      previousRank: s.previousRank || null,
      swapsCompleted: 0
    }));

    return { students: formatted, lastComputed: new Date() };
  }
}
