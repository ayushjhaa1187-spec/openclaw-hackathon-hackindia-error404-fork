import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  authProviderId: { type: String, required: true, unique: true },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  collegeGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollegeGroup' },
  profile: {
    fullName: String,
    email: { type: String, required: true },
    avatar: String,
    department: String,
    year: Number,
    semester: Number,
    bio: String,
    skills: [{
      name: String,
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
      verified: Boolean
    }],
    wantToLearn: [{
      name: String,
      priority: { type: String, enum: ['low', 'medium', 'high'] }
    }]
  },
  karma: {
    total: { type: Number, default: 0 },
    tier: { type: String, default: 'bronze' }
  },
  nexus: {
    crossCampusEnabled: { type: Boolean, default: false },
    partnerCampusAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campus' }]
  },
  moderation: {
    flags: { type: Number, default: 0 },
    status: { type: String, default: 'good_standing' }
  }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
