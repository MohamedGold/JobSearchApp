import { Router } from "express";
import * as userService from "./Service/user.service.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { fileValidations } from "../../utils/multer/local.multer.js";

const userController = Router();

// Update user account (firstName, lastName, DOB, gender, mobileNumber)
userController.patch('/update-account', authentication(), validation(validators.updateAccount), userService.updateAccount);

// Get logged-in user data (with decrypted mobile number)
userController.get('/me', authentication(), userService.getMyAccount);

// Get profile data for another user (only selected fields)
userController.get('/profile/:userId', authentication(), userService.getUserProfile);

// Update password
userController.patch('/update-password', authentication(), validation(validators.updatePassword), userService.updatePassword);

// Upload Profile Pic
userController.patch('/upload-profile-pic', authentication(), uploadCloudFile(fileValidations.image).single("attachment"), validation(validators.profilePic), userService.uploadProfilePic);

// Upload Cover Pic
userController.patch('/upload-cover-pic', authentication(), uploadCloudFile(fileValidations.image).single("attachment"), userService.uploadCoverPic);

// Delete Profile Pic
userController.delete('/delete-profile-pic', authentication(), userService.deleteProfilePic);

// Delete Cover Pic
userController.delete('/delete-cover-pic', authentication(), userService.deleteCoverPic);

// Soft delete account
userController.delete('/delete-account', authentication(), userService.softDeleteAccount);

export default userController;
