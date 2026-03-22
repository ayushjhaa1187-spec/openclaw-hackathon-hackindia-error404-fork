import mongoose, { Schema, model } from 'mongoose';

const FlagSchema = new Schema({
  // Classification
  flagType: {
    type: String,
    enum: [
      'chat_message',          // message in a collab room
      'resource_content',      // uploaded resource metadata
      'swap_review_text',      // text submitted in review/rating
      'profile_bio',           // student bio content
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },

  // Source context
  sourceEntityId: { type: String, required: true },
    // chat: swapRoomId, resource: resourceId, review: swapId, bio: studentId
  sourceEntityType: {
    type: String,
    enum: ['swap_room', 'resource', 'swap_review', 'student_profile'],
    required: true
  },
  involvedUids: [{ type: String }],   // students involved (1 for resource, 2 for chat)
  campus: { type: String, required: true },

  // Content
  flaggedContent: { type: String, required: true },  // the actual text that was flagged
  flagCategories: [{
    type: String,
    enum: [
      'academic_dishonesty',
      'off_platform_payment',
      'off_platform_contact',
      'harassment',
      'inappropriate_content',
      'copyright_concern',
      'spam',
    ]
  }],

  // AI analysis
  detectionMethod: {
    type: String,
    enum: ['keyword_sync', 'gemini_async', 'manual_report'],
    required: true
  },
  aiConfidenceScore: { type: Number, default: null },  // 0-100, null if keyword-only
  aiAnalysisReason: { type: String, default: null },   // Gemini's explanation

  // Resolution
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'escalated', 'actioned'],
    default: 'pending'
  },
  resolvedBy: { type: String, default: null },         // admin uid
  resolvedAt: { type: Date, default: null },
  resolutionNotes: { type: String, default: null },
  resolutionAction: {
    type: String,
    enum: ['no_action', 'warning_issued', 'content_removed',
           'swap_terminated', 'student_suspended', 'student_banned', null],
    default: null
  },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

// Indexes:
FlagSchema.index({ campus: 1, status: 1, createdAt: -1 });  // primary queue query
FlagSchema.index({ sourceEntityId: 1 });                     // lookup by room/resource
FlagSchema.index({ involvedUids: 1 });                       // lookup by student
FlagSchema.index({ severity: 1, status: 1 });                // severity queue filter
// TTL: keep flags for 1 year (governance requirement)
FlagSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const FlagModel = model('Flag', FlagSchema);
