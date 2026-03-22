// ============================================================================
// EDUSYNC MONGODB INDEXES
// Optimizes query performance for all collections
// ============================================================================

const mongoose = require('mongoose');

async function createIndexes(mongoUri) {
  try {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    console.log('🔧 Creating MongoDB indexes...');

    // ====== STUDENTS COLLECTION ======
    await db.collection('students').createIndex({ firebaseUid: 1 }, { unique: true });
    await db.collection('students').createIndex({ campus: 1 });
    await db.collection('students').createIndex({ email: 1 }, { unique: true });
    await db.collection('students').createIndex({ status: 1 });
    await db.collection('students').createIndex({ 'skills.name': 1 });
    await db.collection('students').createIndex({ 'karma.totalEarned': -1 });
    console.log('✅ Students indexes created');

    // ====== SWAPS COLLECTION ======
    await db.collection('swaps').createIndex({ requesterUid: 1 });
    await db.collection('swaps').createIndex({ providerUid: 1 });
    await db.collection('swaps').createIndex({ status: 1 });
    await db.collection('swaps').createIndex({ campusId: 1 });
    await db.collection('swaps').createIndex({ createdAt: -1 });
    await db.collection('swaps').createIndex({ 'offer.skill': 1 });
    await db.collection('swaps').createIndex({ 'request.skill': 1 });
    console.log('✅ Swaps indexes created');

    // ====== RESOURCES COLLECTION ======
    await db.collection('resources').createIndex({ ownerUid: 1 });
    await db.collection('resources').createIndex({ campusId: 1 });
    await db.collection('resources').createIndex({ 'verification.status': 1 });
    await db.collection('resources').createIndex({ category: 1 });
    await db.collection('resources').createIndex({ createdAt: -1 });
    await db.collection('resources').createIndex({ title: 'text', description: 'text' });
    console.log('✅ Resources indexes created');

    // ====== FLAGS COLLECTION ======
    await db.collection('flags').createIndex({ resourceId: 1 });
    await db.collection('flags').createIndex({ flaggingStudentUid: 1 });
    await db.collection('flags').createIndex({ status: 1 });
    await db.collection('flags').createIndex({ createdAt: -1 });
    console.log('✅ Flags indexes created');

    // ====== NOTIFICATIONS COLLECTION ======
    await db.collection('notifications').createIndex({ recipientUid: 1 });
    await db.collection('notifications').createIndex({ type: 1 });
    await db.collection('notifications').createIndex({ isRead: 1 });
    await db.collection('notifications').createIndex({ createdAt: -1 });
    await db.collection('notifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✅ Notifications indexes created');

    // ====== ANALYTICS_SNAPSHOTS COLLECTION ======
    await db.collection('analytics_snapshots').createIndex({ campusId: 1, date: -1 });
    await db.collection('analytics_snapshots').createIndex({ type: 1 });
    console.log('✅ Analytics Snapshots indexes created');

    // ====== CAMPUS_SETTINGS COLLECTION ======
    await db.collection('campus_settings').createIndex({ campusId: 1 }, { unique: true });
    console.log('✅ Campus Settings indexes created');

    // ====== COLLEGE_GROUPS COLLECTION ======
    await db.collection('college_groups').createIndex({ status: 1 });
    await db.collection('college_groups').createIndex({ 'members': 1 });
    console.log('✅ College Groups indexes created');

    console.log('');
    console.log('✅ All MongoDB indexes created successfully');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Index creation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edusync';
  createIndexes(mongoUri);
}

module.exports = { createIndexes };
