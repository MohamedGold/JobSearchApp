import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";


export const shareProfile = joi.object().keys({
  profileId: generalFields.id.required()
}).required();



export const profilePic = joi.object().keys({

  file: generalFields.file.required()

}).required();

export const updateEmail = joi.object().keys({
  email: generalFields.email.required()
}).required();



export const resetEmail = joi.object().keys({
  oldCode: generalFields.code.required(),
  newCode: generalFields.code.required()
}).required();


export const updatePassword = joi.object().keys({
  oldPassword: generalFields.password.required(),
  newPassword: generalFields.password.not(joi.ref("oldPassword")).required(),
  confirmPassword: generalFields.confirmPassword.valid(joi.ref("newPassword")).required(),
}).required();


export const updateAccount = joi.object().keys({
  firstName: generalFields.firstName,
  lastName: generalFields.lastName,
  DOB: generalFields.DOB,
  gender: generalFields.gender,
  mobileNumber: generalFields.phone,
}).required();