import mongoose, { Schema, model, Types } from 'mongoose';

const applicationSchema = new Schema(
  {
    jobId: { type: Types.ObjectId, ref: 'Job', required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    userCV: { secure_url: String, public_id: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'viewed', 'in consideration', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const Application = mongoose.models.Application || model('Application', applicationSchema);
