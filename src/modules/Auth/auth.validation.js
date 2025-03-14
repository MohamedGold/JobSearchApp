import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

// JOI validation schemas for Auth APIs
export const signup = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  DOB: Joi.date().less("now").required(),
  mobileNumber: Joi.string().required()
});

export const confirmOtp = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required()
});

export const signin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});


export const forgetPassword = Joi.object({
  email: generalFields.email.required(),
});


export const resetPassword = Joi.object().keys({
  code: generalFields.code.required(),
  email: generalFields.email.required(),
  newPassword: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword.valid(Joi.ref("newPassword")).required()

}).required();
