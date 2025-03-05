import * as dbService from "../../../DB/db.service.js";
import { providerTypes, roleTypes, User } from "../../../DB/Models/User.model.js";
import { decodedToken, generateToken, tokenTypes } from "../../../utils/security/token.security.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import { emailEvent } from "../../../utils/events/email.events.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../../utils/response/error.response.js";
import crypto from 'crypto';






export const SignUpService = asyncHandler(async (req, res, next) => {

  const { firstName, lastName, email, password, gender, DOB, mobileNumber } = req.body;
  const existing = await dbService.findOne({ model: User, filter: { email } });
  if (existing) return next(new Error("Email already exists", { cause: 409 }));
  const user = await dbService.create({ model: User, data: { firstName, lastName, email, password, gender, DOB, mobileNumber } });
  emailEvent.emit("sendConfirmEmail", { id: user._id, email: user.email });
  return successResponse({ res, status: 201, data: user });

});


export const confirmOtpService = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await dbService.findOne({ model: User, filter: { email } });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  // Filter OTP entries of type "confirmEmail"
  const confirmOTPs = user.OTP.filter(item => item.type === "confirmEmail");


  if (!confirmOTPs.length) {
    return next(new Error("Confirm OTP not found", { cause: 404 }));
  }


  // Get the most recent OTP entry (assumes the newest is added last)
  const otpEntry = confirmOTPs[confirmOTPs.length - 1];

  // Check if the OTP has expired
  if (new Date() > new Date(otpEntry.expiresIn)) {

    // Emit event to send a new OTP to the user's email
    emailEvent.emit("sendConfirmEmail", { id: user._id, email: user.email });
    // Return a response indicating that the OTP expired and a new one has been sent
    return successResponse({ res, message: "OTP expired, another OTP sent to your email", data: {} });
  }

  // Verify the OTP value using compareHash
  if (!compareHash({ plainText: otp, hashValue: otpEntry.code })) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  user.isConfirmed = true;
  await user.save();

  return successResponse({ res, data: user });
});


export const SignInService = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await dbService.findOne({ model: User, filter: { email } });


  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (!user.isConfirmed) {

    emailEvent.emit("sendConfirmEmail", { id: user._id, email: user.email });
    return next(new Error("Verify account first", { cause: 403 }));
  };

  if (!compareHash({ plainText: password, hashValue: user.password })) {
    return next(new Error("Invalid credentials", { cause: 401 }));
  }

  const isAdmin = [roleTypes.admin].includes(user.role);

  const tokens = {
    access_token: generateToken({
      payload: { id: user._id },
      signature: isAdmin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
      expiresIn: 3600
    }),
    refresh_token: generateToken({
      payload: { id: user._id },
      signature: isAdmin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
      expiresIn: 7 * 24 * 60 * 60
    })
  };

  return successResponse({ res, message: "Login successful", data: { token: tokens } });
});


export const signupWithGoogle = asyncHandler(async (req, res, next) => {

  const { idToken } = req.body;
  // Initialize OAuth2Client with your CLIENT_ID
  const client = new OAuth2Client(process.env.CLIENT_ID);
  // Verify the idToken and extract payload
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();

  // Ensure that the email is verified
  if (!payload.email_verified) {
    return next(new Error("Invalid account: Email not verified", { cause: 400 }));
  }

  // Check if a user with the given email already exists
  let user = await dbService.findOne({ model: User, filter: { email: payload.email } });
  if (user) {
    return next(new Error("User already exists", { cause: 409 }));
  }

  // Split the full name into firstName and lastName
  const nameParts = payload.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Generate a random password since it won't be used (for google provider)
  const randomPassword = crypto.randomBytes(16).toString('hex');

  // Create a new user with Google provider details
  user = await dbService.create({
    model: User,
    data: {
      firstName,
      lastName,
      email: payload.email,
      password: randomPassword,
      provider: providerTypes.google,
      isConfirmed: true,
      // Set image if available
      profilePic: { secure_url: payload.picture, public_id: "" }
    }
  });

  return successResponse({ res, status: 201, data: user });

});



export const loginWithGoogle = asyncHandler(async (req, res, next) => {

  const { idToken } = req.body;
  const client = new OAuth2Client(process.env.CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    return next(new Error("Invalid Account", { cause: 400 }));
  }

  let user = await dbService.findOne({ model: User, filter: { email: payload.email } });

  if (!user) {
    user = await dbService.create({
      model: User,
      data: {
        username: payload.name,
        email: payload.email,
        confirmEmail: payload.email_verified,
        image: payload.picture,
        provider: providerTypes.google,
      },
    });
  }

  if (user.provider !== providerTypes.google) {
    return next(new Error("Invalid provider", { cause: 400 }));
  }

  const isAdmin = [roleTypes.admin, roleTypes.superAdmin].includes(user.role);
  const access_token = generateToken({
    payload: { id: user._id },
    signature: isAdmin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
    expiresIn: 3600,
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature: isAdmin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
    expiresIn: 7 * 24 * 60 * 60,
  });

  return successResponse({
    res,
    status: 200,
    data: {
      token: {
        access_token,
        refresh_token,
      },
    },
  });

});



export const forgetPasswordService = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await dbService.findOne({ model: User, filter: { email } });

  if (!user) return next(new Error("User not found", { cause: 404 }));

  emailEvent.emit("forgotPassword", { id: user._id, email: user.email });

  return successResponse({ res, data: { message: "OTP sent for password reset" } });
});


export const resetPasswordService = asyncHandler(async (req, res, next) => {
  const { email, code, newPassword } = req.body;
  const user = await dbService.findOne({ model: User, filter: { email } });

  if (!user) return next(new Error("User not found", { cause: 404 }));


  if (!user.isConfirmed) {
    return next(new Error(" Verify your Account First", { cause: 400 }));
  }

  // Filter the OTP array to get only forgetPassword OTPs
  const forgetOTPs = user.OTP.filter(item => item.type === "forgetPassword");
  if (!forgetOTPs.length) {
    return next(new Error("forgetPassword OTP not found", { cause: 400 }));
  }


  // Get the most recent OTP entry (assumes the newest is added last)
  const otpEntry = forgetOTPs[forgetOTPs.length - 1];

  // Check if the OTP has expired
  if (new Date() > new Date(otpEntry.expiresIn)) {

    // Emit event to send a new OTP to the user's email
    emailEvent.emit("forgotPassword", { id: user._id, email: user.email });
    // Return a response indicating that the OTP expired and a new one has been sent
    return successResponse({ res, message: "OTP expired, another OTP sent to your email", data: {} });
  }

  if (!compareHash({ plainText: code, hashValue: otpEntry.code })) {
    return next(new Error(" In-valid reset code", { cause: 400 }));
  }
  user.password = newPassword;
  user.changeCredentialsTime = Date.now();
  user.passwordUpdatedAt = Date.now();
  await user.save();
  return successResponse({ res, data: { user } });
});


export const refreshTokenService = asyncHandler(async (req, res, next) => {

  const { authorization } = req.headers;

  const user = await decodedToken({ authorization, tokenType: tokenTypes.refresh, next });

  const token = authorization.split(" ")[1];
  const signature = authorization.startsWith("System")
    ? process.env.ADMIN_REFRESH_TOKEN
    : process.env.USER_REFRESH_TOKEN;
  const tokenPayload = jwt.verify(token, signature);

  // Check if the refresh token was issued before the last password update
  if (user.changeCredentialsTime && tokenPayload.iat * 1000 < new Date(user.passwordUpdatedAt).getTime()) {
    return next(new Error("Invalid refresh token. Please log in again.", { cause: 401 }));
  }

  const isAdmin = user.role === roleTypes.admin;
  const access_token = generateToken({
    payload: { id: user._id },
    signature: isAdmin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
    expiresIn: 3600
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature: isAdmin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
    expiresIn: 7 * 24 * 60 * 60
  });

  return successResponse({ res, data: { token: { access_token, refresh_token } } });

});