import { Schema, model, models } from 'mongoose';

const AnalyticsSnapshotSchema = new Schema({
  campus: {
    type: String,
    enum: ['IIT_JAMMU', 'IIT_DELHI', 'IIT_BOMBAY', 'IIT_KANPUR', 'NIT_TRICHY'],
    required: true
  },
  snapshotDate: { type: Date, required: true },  // Daily at midnight UTC
  metrics: {
    // Swap metrics
    totalSwapsInitiated: { type: Number, default: 0 },
    totalSwapsCompleted: { type: Number, default: 0 },
    totalSwapsCanceled: { type: Number, default: 0 },
    totalSwapsDisputed: { type: Number, default: 0 },
    crossCampusSwapsCompleted: { type: Number, default: 0 },
    averageSwapCompletionHours: { type: Number, default: 0 },

    // Vault metrics
    totalResourcesUploaded: { type: Number, default: 0 },
    totalResourcesCertified: { type: Number, default: 0 },
    totalResourcesPurchased: { type: Number, default: 0 },
    totalKarmaFromVault: { type: Number, default: 0 },

    // Karma metrics
    totalKarmaEarned: { type: Number, default: 0 },
    totalKarmaSpent: { type: Number, default: 0 },
    karmaCirculationVelocity: { type: Number, default: 1.0 },

    // Student metrics
    activeStudents: { type: Number, default: 0 },
    newStudents: { type: Number, default: 0 },
    nexusEnabledStudents: { type: Number, default: 0 },

    // MOU metrics
    activeMOUCount: { type: Number, default: 0 },
    crossCampusConnectionsInitiated: { type: Number, default: 0 },
    crossCampusConnectionsCompleted: { type: Number, default: 0 }
  },
  generatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: false,
  collection: 'analytics_snapshots'
});

// Compound index for efficient range queries
AnalyticsSnapshotSchema.index({ campus: 1, snapshotDate: -1 });

// TTL: keep snapshots for 2 years (63072000 seconds)
AnalyticsSnapshotSchema.index({ generatedAt: 1 }, { expireAfterSeconds: 63072000 });

// Ensure uniqueness per campus per day
AnalyticsSnapshotSchema.index({ campus: 1, snapshotDate: 1 }, { unique: true });

export const AnalyticsSnapshotModel = models.AnalyticsSnapshot || model('AnalyticsSnapshot', AnalyticsSnapshotSchema);
