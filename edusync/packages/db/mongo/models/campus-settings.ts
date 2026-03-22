import { Schema, model } from 'mongoose';

const CampusSettingsSchema = new Schema({
  campus: {
    type: String,
    enum: ['IIT_JAMMU', 'IIT_DELHI', 'IIT_BOMBAY', 'IIT_KANPUR', 'NIT_TRICHY'],
    required: true,
    unique: true   // one settings document per campus
  },

  // Nexus configuration
  nexus: {
    enabled: { type: Boolean, default: false },
    autoApproveIntraGroupSwaps: { type: Boolean, default: false },
    requireAdminApprovalForCrossCampus: { type: Boolean, default: true },
    maxCrossSwapsPerStudent: { type: Number, default: 10 }
  },

  // Guardian AI configuration
  guardian: {
    aiModerationEnabled: { type: Boolean, default: true },
    customKeywords: [{ type: String }],
    // Campus-specific keywords added on top of HIGH_RISK_KEYWORDS
    autoSuspendAfterFlags: { type: Number, default: 5 },
    // Auto-suspend student after N flags without admin action
    resourceScreeningEnabled: { type: Boolean, default: true }
  },

  // Karma economy configuration
  karma: {
    uploadBonusAmount: { type: Number, default: 10 },
    certificationBonusAmount: { type: Number, default: 20 },
    minimumSwapStake: { type: Number, default: 10 },
    vaultPlatformFeePercent: { type: Number, default: 5 }
    // References the 95/5 split from Session 6
  },

  // Verification configuration
  verification: {
    autoScreenNewResources: { type: Boolean, default: true },
    requireVerificationForNexusResources: { type: Boolean, default: true }
  },

  // Display configuration
  display: {
    campusFullName: { type: String, required: true },
    campusShortCode: { type: String, required: true },
    primaryColor: { type: String, default: '#6366f1' },
    logoUrl: { type: String, default: null }
  },

  updatedBy: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now }
});

CampusSettingsSchema.index({ campus: 1 }, { unique: true });

export const CampusSettingsModel = model('CampusSettings', CampusSettingsSchema);
