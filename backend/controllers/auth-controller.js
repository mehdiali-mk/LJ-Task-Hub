import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import { sendSms, sendWhatsapp } from "../libs/send-sms.js";
import aj from "../libs/arcjet.js";

const registerUser = async (req, res) => {
  try {
    const { email, name, password, phoneNumber } = req.body;
    
    // Arcjet protection (if email present)
    if (email) {
        const decision = await aj.protect(req, { email });
        if (decision.isDenied()) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid email address" }));
            return;
        }
    }

    // Check for duplicates
    if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email address already in use" });
        }
    }

    if (phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({ message: "Phone number already in use" });
        }
    }
    
    if (!email && !phoneNumber) {
        return res.status(400).json({ message: "Either Email or Phone Number is required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: email || undefined,
      password: hashPassword,
      name,
      phoneNumber: phoneNumber || undefined,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Verification.create({
      userId: newUser._id,
      token: verificationCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Send Verification
    let sent = false;
    
    if (email) {
        const emailBody = `<p>Your verification code is: <strong>${verificationCode}</strong></p><p>This code will expire in 15 minutes.</p>`;
        const isEmailSent = await sendEmail(email, "Verify your account", emailBody);
        if (isEmailSent) sent = true;
    }

    if (phoneNumber) {
        const smsBody = `Your TaskHub verification code is: ${verificationCode}`;
        const isSmsSent = await sendSms(phoneNumber, smsBody);
        const isWaSent = await sendWhatsapp(phoneNumber, smsBody);
        if (isSmsSent || isWaSent) sent = true;
    }

    res.status(201).json({
      message: "Account created. Verification code sent.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const isEmail = identifier.includes("@");
    const query = isEmail ? { email: identifier } : { phoneNumber: identifier };

    const user = await User.findOne(query).select("+password");
    console.log("Login Attempt:", identifier, "Found:", !!user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //* Verification Check
    const isVerified = isEmail ? user.isEmailVerified : user.isPhoneVerified;

    if (!isVerified) {
        console.log("User unverified on this channel. Resending OTP.");
       // Logic to resend OTP
      const existingVerification = await Verification.findOne({
        userId: user._id,
      });

      if (existingVerification && existingVerification.expiresAt > new Date()) {
        return res.status(201).json({
          message:
            "Account not verified. Please check your email/phone for the verification code.",
        });
      } else {
        if (existingVerification) {
            await Verification.findByIdAndDelete(existingVerification._id);
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await Verification.create({
          userId: user._id,
          token: verificationCode,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        // Send to specific channel
        if (isEmail && user.email) {
             const emailBody = `<p>Your verification code is: <strong>${verificationCode}</strong></p>`;
             await sendEmail(user.email, "Verify Account", emailBody);
        } else if (!isEmail && user.phoneNumber) {
             const smsBody = `Your TaskHub verification code is: ${verificationCode}`;
            sendSms(user.phoneNumber, smsBody);
            sendWhatsapp(user.phoneNumber, smsBody);
        }

        res.status(201).json({
          message:
            "Verification code sent. Please check and verify your account.",
        });
        return; 
      }
    }
    //* END Verification Check

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2FA Check - if enabled, send OTP and require verification
    if (user.is2FAEnabled) {
      // Clean existing verifications
      await Verification.deleteMany({ userId: user._id });

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      await Verification.create({
        userId: user._id,
        token: verificationCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      // Send 2FA code to email
      const emailBody = `<p>Your two-factor authentication code is: <strong>${verificationCode}</strong></p><p>This code will expire in 15 minutes.</p>`;
      await sendEmail(user.email, "Two-Factor Authentication Code", emailBody);

      return res.status(200).json({
        requires2FA: true,
        userId: user._id,
        message: "2FA code sent to your email",
      });
    }

    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    user.isOnline = true;
    user.lastActiveAt = new Date();
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isOnline = false;
    user.lastActiveAt = new Date();
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//* START verification function is commented on 10th August 2025 email
const verifyEmail = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    const isEmail = identifier.includes("@");
    const query = isEmail ? { email: identifier } : { phoneNumber: identifier };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (isEmail && user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    if (!isEmail && user.isPhoneVerified) {
        return res.status(400).json({ message: "Phone already verified" });
    }

    const verification = await Verification.findOne({
      userId: user._id,
      token: otp, // Check if the stored token matches the OTP
    });

    if (!verification) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (isEmail) {
        user.isEmailVerified = true;
    } else {
        user.isPhoneVerified = true;
    }
    await user.save();
    console.log("User verified successfully:", isEmail ? "Email" : "Phone");

    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({ message: "Verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//* END verification function is commented on 10th August 2025 email

const sendVerificationCode = async (req, res) => {
    try {
        const { channel } = req.body; // 'email' or 'phone'
        const userId = req.user.userId; // Middleware auth
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (channel === 'email') {
            if (user.isEmailVerified) return res.status(400).json({ message: "Already verified" });
            if (!user.email) return res.status(400).json({ message: "No email linked" });
        } else if (channel === 'phone') {
            if (user.isPhoneVerified) return res.status(400).json({ message: "Already verified" });
            if (!user.phoneNumber) return res.status(400).json({ message: "No phone linked" });
        } else {
            return res.status(400).json({ message: "Invalid channel" });
        }

        // Clean existing
        await Verification.deleteMany({ userId: user._id });

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await Verification.create({
            userId: user._id,
            token: verificationCode,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        if (channel === 'email') {
             const emailBody = `<p>Your verification code is: <strong>${verificationCode}</strong></p>`;
             await sendEmail(user.email, "Verify Account", emailBody);
        } else {
             const smsBody = `Your TaskHub verification code is: ${verificationCode}`;
            sendSms(user.phoneNumber, smsBody);
            sendWhatsapp(user.phoneNumber, smsBody);
        }

        res.status(200).json({ message: "Verification code sent" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    const existingVerification = await Verification.findOne({
      userId: user._id,
    });

    if (existingVerification && existingVerification.expiresAt > new Date()) {
      return res.status(400).json({
        message: "Reset password request already sent",
      });
    }

    if (existingVerification && existingVerification.expiresAt < new Date()) {
      await Verification.findByIdAndDelete(existingVerification._id);
    }

    const resetPasswordToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    const emailBody = `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`;
    const emailSubject = "Reset your password";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send reset password email",
      });
    }

    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { userId, purpose } = payload;

    if (purpose !== "reset-password") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({ message: "Token expired" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Enable 2FA for user
const enable2FA = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (!user.isEmailVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }
    
    if (user.is2FAEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }
    
    user.is2FAEnabled = true;
    await user.save();
    
    res.status(200).json({ message: "Two-factor authentication enabled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Disable 2FA for user
const disable2FA = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (!user.is2FAEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }
    
    user.is2FAEnabled = false;
    await user.save();
    
    res.status(200).json({ message: "Two-factor authentication disabled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify 2FA OTP during login
const verify2FA = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });
    
    const verification = await Verification.findOne({
      userId: user._id,
      token: otp,
    });
    
    if (!verification) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    
    if (verification.expiresAt < new Date()) {
      return res.status(400).json({ message: "Code expired" });
    }
    
    // Clean up verification
    await Verification.findByIdAndDelete(verification._id);
    
    // Issue token
    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    user.lastLogin = new Date();
    user.isOnline = true;
    user.lastActiveAt = new Date();
    await user.save();
    
    const userData = user.toObject();
    delete userData.password;
    
    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  sendVerificationCode,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword,
  enable2FA,
  disable2FA,
  verify2FA,
};
