import mongoose, { Schema, model } from 'mongoose';

// High Volume Student Profile Data for the Matching Engine
const StudentProfileSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  campus: { type: String, enum: ['IIT_JAMMU', 'IIT_DELHI', 'IIT_BOMBAY', 'IIT_KANPUR', 'NIT_TRICHY'], required: true },
  specialization: { type: String },
  skills: [{ type: String }],
  karma: { type: Number, default: 0 },
  verifiedInstitutionalId: { type: Boolean, default: false },
  avatarUrl: { type: String },
  reputationScore: { type: Number, default: 1.0 },
  onboardingStatus: { type: String, enum: ['initial', 'skills_added', 'node_synced', 'complete'], default: 'initial' },
});

// Real-time Collaborative Session Data
const SkillSwapRequestSchema = new Schema({
  requesterUid: { type: String, required: true, index: true },
  providerUid: { type: String, required: true, index: true },
  type: { type: String, enum: ['swap', 'one_way_tutor', 'group_session'], default: 'swap' },
  offer: { skill: String, level: String },
  request: { skill: String, level: String },
  status: { type: String, enum: ['pending', 'accepted', 'active', 'completed', 'canceled'], default: 'pending' },
  karmaStaked: { type: Number, required: true },
  isCrossCampus: { type: Boolean, default: false },
  sessionStartTime: { type: Date },
  sessionEndTime: { type: Date },
  interCampusNode: { type: Boolean, default: false },
}, { timestamps: true });

// Knowledge Vault Resource Schema
const ResourceSchema = new Schema({
  ownerUid: { type: String, required: true, index: true },
  title: { type: String, required: true, index: 'text' },
  description: { type: String },
  campus: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['PDF', 'Video', 'Image', 'Archive'], required: true },
  karmaCost: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  downloads: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

export const StudentModel = model('Student', StudentProfileSchema);
export const SwapModel = model('Swap', SkillSwapRequestSchema);
export const ResourceModel = model('Resource', ResourceSchema);
