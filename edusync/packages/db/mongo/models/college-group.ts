import { Schema, model, models } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CollegeGroupSchema = new Schema({
  collegeGroupId: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    type: String, // campusId
    required: true
  }],
  createdBy: {
    type: String, // adminUid
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'dissolved'],
    default: 'active'
  },
  dissolvedAt: {
    type: Date
  },
  metadata: {
    crossCampusSwaps: { type: Number, default: 0 },
    healthScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Ensure we don't overwrite if model already exists
export const CollegeGroupModel = models.CollegeGroup || model('CollegeGroup', CollegeGroupSchema);
