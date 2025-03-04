import mongoose, { Schema, model, Types } from 'mongoose';
import { generateHash } from '../../utils/security/hash.security.js';
import { Encryption } from '../../utils/encryption.utils.js';
import * as dbService from "../db.service.js";
import { Company } from './Company.model.js';
import { Chat } from './Chat.model.js';
import { Job } from './Job.model.js';
import { Application } from './Application.model.js';


export const genderTypes = { male: 'Male', female: 'Female' };
export const providerTypes = { google: 'google', system: 'system' };
export const roleTypes = { user: 'User', admin: 'Admin' };

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    provider: { type: String, enum: ['google', 'system'], default: 'system' },
    gender: { type: String, enum: ['Male', 'Female'], default: "Male" },
    DOB: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v < new Date();
        },
        message: props => `${props.value} is not a valid birth date!`
      }
    },
    mobileNumber: { type: String, required: true },
    role: { type: String, enum: ['User', 'Admin'], default: 'User' },
    isConfirmed: { type: Boolean, default: false },
    deletedAt: { type: Date },
    bannedAt: { type: Date },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    changeCredentialTime: { type: Date },
    passwordUpdatedAt: { type: Date },
    profilePic: { secure_url: String, public_id: String },
    coverPic: { secure_url: String, public_id: String },
    changeCredentialsTime: Date,
    OTP: [
      {
        code: { type: String },
        type: { type: String, enum: ['confirmEmail', 'forgetPassword', 'updateEmail'] },
        expiresIn: { type: Date }
      }
    ]
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }

  }
);

// Virtual for username (firstName + lastName)
userSchema.virtual('username').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook: hash password and encrypt mobileNumber if modified
userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = generateHash({ plainText: this.password });
  }
  if (this.isModified('mobileNumber')) {
    this.mobileNumber = Encryption({ value: this.mobileNumber, secretKey: process.env.ENCRYPTION_KEY });
  }
  next();
});

//  cascade deletion hook (to delete related documents when a user is deleted)
userSchema.pre('findOneAndDelete', async function (next) {
  try {
    const userToDelete = await this.model.findOne(this.getFilter());
    if (!userToDelete) {
      return next();
    }
    const userId = userToDelete._id;

    // Delete all applications submitted by this user
    await dbService.deleteMany({
      model: Application,
      filter: { userId }
    });

    // Delete all jobs created by this user
    await dbService.deleteMany({
      model: Job,
      filter: { addedBy: userId }
    });

    // Delete all chats where the user is either sender or receiver
    await dbService.deleteMany({
      model: Chat,
      filter: { $or: [{ senderId: userId }, { receiverId: userId }] }
    });

    // Delete all companies created by this user (newly added)
    await dbService.deleteMany({
      model: Company,
      filter: { createdBy: userId }
    });

    next();
  } catch (error) {
    next(error);
  }
});




export const User = mongoose.models.User || model('User', userSchema);

export const socketConnection = new Map();

