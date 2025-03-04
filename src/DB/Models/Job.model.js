import mongoose, { Schema, model, Types } from 'mongoose';
import * as dbService from "../db.service.js";
import { Application } from './Application.model.js';
const jobSchema = new Schema(
  {
    jobTitle: { type: String, required: true },
    jobLocation: { type: String, enum: ['onsite', 'remotely', 'hybrid'], required: true },
    workingTime: { type: String, enum: ['part-time', 'full-time'], required: true },
    seniorityLevel: {
      type: String,
      enum: ['fresh', 'Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO'],
      required: true
    },
    jobDescription: { type: String, required: true },
    technicalSkills: [{ type: String }],
    softSkills: [{ type: String }],
    addedBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    closed: { type: Boolean, default: false },
    companyId: { type: Types.ObjectId, ref: 'Company', required: true },
    deletedAt: { type: Date }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

// Virtual populate for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId'
});

// Cascade deletion hook: delete related applications when a job is deleted
jobSchema.pre('findOneAndDelete', async function (next) {
  const job = await this.model.findOne(this.getFilter());
  if (job) {

    await dbService.deleteMany({
      model: Application,
      filter: { jobId: job._id }
    });
  }
  next();
});

export const Job = mongoose.models.Job || model('Job', jobSchema);
