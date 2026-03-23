import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['notes', 'past_paper', 'assignment', 'project_report', 'tutorial'] },
  subject: String,
  courseCode: String,
  department: String,
  year: Number,
  semester: Number,
  fileUrl: String,
  karmaCost: { type: Number, default: 10 },
  visibility: { type: String, enum: ['campus_only', 'college_group', 'nexus_partners', 'public'], default: 'campus_only' },
  verification: {
    status: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'pending' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  stats: {
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
