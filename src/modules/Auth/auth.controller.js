import { Router } from "express";
import * as authService from "./Services/auth.service.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";

const authController = Router();

// Sign Up
authController.post('/signup', validation(validators.signup), authService.SignUpService);

// Confirm OTP
authController.patch('/confirm-otp', validation(validators.confirmOtp), authService.confirmOtpService);

// Sign In
authController.post('/signin', validation(validators.signin), authService.SignInService);

// Signup with Google
authController.post('/signup-google', authService.signupWithGoogle);

// Login with Google
authController.post('/login-google', authService.loginWithGoogle);

// Send OTP for Forget Password
authController.patch('/forget-password', validation(validators.forgetPassword), authService.forgetPasswordService);

// Reset Password
authController.patch('/reset-password', validation(validators.resetPassword), authService.resetPasswordService);

// Refresh Token
authController.get('/refresh-token', authService.refreshTokenService);

export default authController;
