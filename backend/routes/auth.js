import express from "express";

import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../libs/validate-schema.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordRequest,
  verifyEmail,
  verifyResetPasswordTokenAndResetPassword,
  sendVerificationCode,
  enable2FA,
  disable2FA,
  verify2FA,
} from "../controllers/auth-controller.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

console.log("[DEBUG] Registering Auth Routes including /send-verification");

// Route moved to top for debugging
router.post(
  "/send-verification",
  authMiddleware,
  sendVerificationCode
);

router.post(
  "/register",
  validateRequest({
    body: registerSchema,
  }),
  registerUser
);
router.post(
  "/login",
  validateRequest({
    body: loginSchema,
  }),
  loginUser
);

router.post(
  "/verify-email",
  validateRequest({
    body: verifyEmailSchema,
  }),
  verifyEmail
);

router.post(
  "/reset-password-request",
  validateRequest({
    body: emailSchema,
  }),
  resetPasswordRequest
);

router.post(
  "/reset-password",
  validateRequest({
    body: resetPasswordSchema,
  }),
  verifyResetPasswordTokenAndResetPassword
);

// Logout route - requires authentication to properly track user status
router.post("/logout", authMiddleware, logoutUser);

// 2FA Routes
router.post("/enable-2fa", authMiddleware, enable2FA);
router.post("/disable-2fa", authMiddleware, disable2FA);
router.post("/verify-2fa", verify2FA);

export default router;

