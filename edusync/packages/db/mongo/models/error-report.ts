import mongoose, { Schema, model } from 'mongoose';

const ErrorReportSchema = new Schema({
  errorMessage: { type: String, required: true },
  errorStack: { type: String },
  componentStack: { type: String },
  type: { type: String, default: 'unhandled' },
  url: { type: String },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'low' },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  notes: { type: String },
  resolvedBy: { type: String }
}, {
  timestamps: true
});

export const ErrorReportModel = mongoose.models.ErrorReport || model('ErrorReport', ErrorReportSchema);
