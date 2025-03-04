import mongoose, { Schema, model, Types } from 'mongoose';
import * as dbService from "../db.service.js";



const companySchema = new Schema(
  {
    companyName: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    address: { type: String, required: true },
    numberOfEmployees: { type: String, required: true }, // e.g., "11-20"
    companyEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    logo: { secure_url: String, public_id: String },
    coverPic: { secure_url: String, public_id: String },
    HRs: [{ type: Types.ObjectId, ref: 'User' }],
    bannedAt: { type: Date },
    deletedAt: { type: Date },
    legalAttachment: { secure_url: String, public_id: String },
    approvedByAdmin: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

// Virtual populate for jobs related to this company
companySchema.virtual('jobs', {
  ref: 'Job',          // the Job model
  localField: '_id',   // the field in Company
  foreignField: 'companyId', // the field in Job that references Company
  justOne: false
});

// Cascade deletion hook (delete related jobs when a company is deleted)
companySchema.pre('findOneAndDelete', async function (next) {
  try {
    // 1) Find the company being deleted
    const companyToDelete = await this.model.findOne(this.getFilter());
    if (!companyToDelete) {
      return next();
    }
    const companyId = companyToDelete._id;

    // 2) Delete all Jobs that belong to this company
    //    (which will also cascade-delete Applications due to the Job hook)
    await dbService.deleteMany({
      model: Job,
      filter: { companyId }
    });

    next();
  } catch (error) {
    next(error);
  }
});

export const Company = mongoose.models.Company || model('Company', companySchema);
