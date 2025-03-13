import * as dbService from "../../../DB/db.service.js";
import { User } from "../../../DB/Models/User.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import { Decryption, Encryption } from "../../../utils/encryption.utils.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { Company } from "../../../DB/Models/Company.model.js";





export const updateAccount = asyncHandler(async (req, res, next) => {

  const { firstName, lastName, DOB, gender, mobileNumber } = req.body;

  const updatedData = { firstName, lastName, DOB, gender };

  // If mobileNumber is provided, encrypt it before updating
  if (mobileNumber) {
    updatedData.mobileNumber = Encryption({ value: mobileNumber, secretKey: process.env.ENCRYPTION_KEY });
  }

  const updatedUser = await dbService.findOneAndUpdate({
    model: User,
    filter: { _id: req.user._id },
    data: updatedData,
    option: { new: true }
  });
  return successResponse({ res, data: updatedUser });

});


export const getMyAccount = asyncHandler(async (req, res, next) => {

  const user = await dbService.findOne({ model: User, filter: { _id: req.user._id } });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  // Decrypt the mobile number before returning it
  if (user.mobileNumber) {
    user.mobileNumber = Decryption({ cipher: user.mobileNumber, secretKey: process.env.ENCRYPTION_KEY });
  }

  // Determine displayRole based on company ownership and HR status
  let displayRole = "User";
  // Check if the user is a company owner (created a company)
  const companyOwner = await dbService.findOne({ model: Company, filter: { createdBy: req.user._id } });
  if (companyOwner) {
    displayRole = "Company Owner";
  } else {
    // Check if the user is in any company's HRs array
    const hrCompany = await dbService.findOne({ model: Company, filter: { HRs: req.user._id } });
    if (hrCompany) {
      displayRole = "HR";
    }
  }

  // Append displayRole to the user object
  const userObj = user.toObject();
  userObj.displayRole = displayRole;

  return successResponse({ res, data: userObj });

});



export const getUserProfile = asyncHandler(async (req, res, next) => {

  const user = await dbService.findOne({
    model: User,
    filter: { _id: req.params.userId },
    select: "firstName lastName mobileNumber profilePic coverPic"
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));
  // Decrypt mobileNumber before returning the profile
  if (user.mobileNumber) {
    user.mobileNumber = Decryption({ cipher: user.mobileNumber, secretKey: process.env.ENCRYPTION_KEY });
  }
  return successResponse({ res, data: user });

});


export const updatePassword = asyncHandler(async (req, res, next) => {

  const { oldPassword, newPassword } = req.body;
  const user = await dbService.findOne({ model: User, filter: { _id: req.user._id } });
  if (!user || !compareHash({ plainText: oldPassword, hashValue: user.password })) {
    return next(new Error("Invalid old password", { cause: 400 }));
  }
  user.password = newPassword;
  user.changeCredentialsTime = Date.now();
  user.passwordUpdatedAt = Date.now();
  await user.save();
  return successResponse({ res, data: { message: "Password updated" } });

});



export const uploadProfilePic = asyncHandler(async (req, res, next) => {


  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `JobSearchApp/user/${req.user._id}/profile` });


  const user = await dbService.findOneAndUpdate({
    model: User,
    filter: { _id: req.user._id },
    data: { profilePic: { secure_url, public_id } },
    option: { new: true }
  });
  return successResponse({ res, data: user });

});



export const uploadCoverPic = asyncHandler(async (req, res, next) => {
  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `JobSearchApp/user/${req.user._id}/cover` });
  const user = await dbService.findOneAndUpdate({
    model: User,
    filter: { _id: req.user._id },
    data: { coverPic: { secure_url, public_id } },
    option: { new: true }
  });
  return successResponse({ res, data: user });
});


export const deleteProfilePic = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOne({ model: User, filter: { _id: req.user._id } });
  user.profilePic = undefined;
  await user.save();
  return successResponse({ res, data: { message: "Profile pic deleted" } });
});

export const deleteCoverPic = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOne({ model: User, filter: { _id: req.user._id } });
  user.coverPic = undefined;
  await user.save();
  return successResponse({ res, data: { message: "Cover pic deleted" } });
});

export const softDeleteAccount = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOneAndUpdate({
    model: User,
    filter: { _id: req.user._id },
    data: { deletedAt: new Date() },
    option: { new: true }
  });
  return successResponse({ res, data: { message: "Account deleted" } });
});
