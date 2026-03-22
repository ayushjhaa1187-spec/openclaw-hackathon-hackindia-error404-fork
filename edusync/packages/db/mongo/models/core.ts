import mongoose, { Schema, model } from 'mongoose';

// High Volume Student Profile Data for the Matching Engine
const StudentProfileSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  campus: { type: String, enum: ['IIT_JAMMU', 'IIT_DELHI', 'IIT_BOMBAY', 'IIT_KANPUR', 'NIT_TRICHY'], required: true },
  specialization: { type: String },
  department: { type: String },
  year: { type: Number },
  semester: { type: Number },
  skills: [{ type: String, index: true }],
  wantToLearn: [{ type: String, index: true }],
  karma: { type: Number, default: 0, index: true },
  karmaRank: { type: Number, default: null, index: true },
  previousRank: { type: Number, default: null },
  rankTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
    index: true
  },
  verifiedInstitutionalId: { type: Boolean, default: false },
  avatarUrl: { type: String },
  campusId: { type: String, required: true, index: true },
  collegeGroupId: { type: String, required: true, index: true },
  nexus: {
    crossCampusEnabled: { type: Boolean, default: false, index: true },
    partnerCampusAccess: [{ type: String }],
    nexusCredits: { type: Number, default: 0 },
  },
  notificationPreferences: {
    swaps: { type: Boolean, default: true },
    vault: { type: Boolean, default: true },
    karma: { type: Boolean, default: true },
    admin: { type: Boolean, default: true },
  },
  privacySettings: {
    showOnLeaderboard: { type: Boolean, default: true },
    showKarmaBalance: { type: Boolean, default: true },
  },
  reputationScore: { type: Number, default: 1.0 },
  onboardingStatus: { type: String, enum: ['initial', 'skills_added', 'node_synced', 'complete'], default: 'initial' },
  moderation: {
    flags: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['good_standing', 'warning', 'suspended', 'banned'],
      default: 'good_standing'
    },
    lastReviewedBy: { type: String, default: null },
    suspendedUntil: { type: Date, default: null }
  }
});

// Real-time Collaborative Session Data
const SkillSwapRequestSchema = new Schema({
  requesterUid: { type: String, required: true, index: true },
  providerUid: { type: String, required: true, index: true },
  type: { type: String, enum: ['swap', 'one_way_tutor', 'group_session'], default: 'swap' },
  offer: { skill: String, level: String },
  request: { skill: String, level: String },
  status: { type: String, enum: ['pending', 'accepted', 'active', 'completed', 'canceled', 'disputed'], default: 'pending' },
  karmaStaked: { type: Number, required: true },
  cancelRequestedBy: { type: String },
  adminNotes: { type: String },
  isStale: { type: Boolean, default: false },
  isCrossCampus: { type: Boolean, default: false },
  sessionStartTime: { type: Date },
  sessionEndTime: { type: Date },
  interCampusNode: { type: Boolean, default: false },
  sessions: [{
    startTime: { type: Date },
    endTime: { type: Date },
    notes: { type: String },
    flags: [{ type: Schema.Types.ObjectId, ref: 'Flag' }]
  }],
}, { timestamps: true });

// Knowledge Vault Resource Schema
const ResourceSchema = new Schema({
  ownerUid: { type: String, required: true, index: true },
  title: { type: String, required: true, index: 'text' },
  description: { type: String },
  subject: { type: String, index: true },
  courseCode: { type: String, index: true },
  campusId: { type: String, required: true, index: true },
  collegeGroupId: { type: String, index: true },
  visibility: { 
    type: String, 
    enum: ['campus_only', 'college_group', 'nexus_partners', 'public'], 
    default: 'public' 
  },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['PDF', 'Video', 'Image', 'Archive'], required: true },
  karmaCost: { type: Number, default: 0 },
  verification: {
    status: { 
      type: String, 
      enum: ['pending', 'under_review', 'changes_requested', 'verified', 'rejected'], 
      default: 'pending' 
    },
    verifiedBy: { type: String, default: null },    // admin uid
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    changesRequested: { type: String, default: null },
    aiSafetyScore: { type: Number, default: null },  // 0-100, estimated from Gemini
    aiSafetyVerdict: { 
      type: String, 
      enum: ['clean', 'flagged', 'unscreened'], 
      default: 'unscreened' 
    },
    aiSafetyFlags: [{ type: String }],               // array of flag categories
    reviewAttempts: { type: Number, default: 0 }     // how many times admin has reviewed
  },
  adminNotes: { type: String, default: null },
  downloads: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

export const StudentModel = model('Student', StudentProfileSchema);
export const SwapModel = model('Swap', SkillSwapRequestSchema);
export const ResourceModel = model('Resource', ResourceSchema);
