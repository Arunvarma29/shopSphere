import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PendingSignup from "../models/PendingSignup.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signAccess,
  newRefreshToken,
  hashToken,
  refreshCookieOptions,
} from "../utils/tokens.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/email.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_VERIFICATION_TTL = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL = 30 * 60 * 1000;

const asString = (value) => (typeof value === "string" ? value : "");
const normalizeEmail = (email) => asString(email).trim().toLowerCase();
const validEmail = (email) => EMAIL_PATTERN.test(email);
const validPassword = (password) =>
  password.length >= 10 && Buffer.byteLength(password, "utf8") <= 72;
const requestBody = (req) =>
  req.body && typeof req.body === "object" ? req.body : {};
const newActionToken = () => crypto.randomBytes(32).toString("hex");

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const issueSession = async (user, res) => {
  const refresh = newRefreshToken();
  user.refreshTokenHash = hashToken(refresh);
  await user.save();
  res.cookie("refreshToken", refresh, refreshCookieOptions());
  return { accessToken: signAccess(user), user: safeUser(user) };
};

export const register = asyncHandler(async (req, res) => {
  const body = requestBody(req);
  const name = asString(body.name).trim();
  const email = normalizeEmail(body.email);
  if (!name || name.length > 80 || email.length > 254 || !validEmail(email)) {
    return res.status(400).json({
      message: "Enter your name and a valid email address.",
    });
  }

  if (await User.exists({ email })) {
    return res.status(409).json({
      message:
        "This email is already registered. Sign in to verify your email or reset your password.",
    });
  }

  const token = newActionToken();
  const verificationTokenHash = hashToken(token);
  const pendingSignup = await PendingSignup.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        verificationTokenHash,
        verificationExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL),
      },
    },
    { new: true, upsert: true, runValidators: true },
  );

  try {
    await sendVerificationEmail({ email, name, token });
  } catch (error) {
    await PendingSignup.deleteOne({
      _id: pendingSignup._id,
      verificationTokenHash,
    });
    throw error;
  }

  res.status(202).json({
    message: "Check your email for a link to verify and create your account.",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const body = requestBody(req);
  const token = asString(body.token);
  if (!/^[a-f0-9]{64}$/i.test(token))
    return res.status(400).json({ message: "This verification link is invalid or expired." });

  const tokenHash = hashToken(token);
  const pendingSignup = await PendingSignup.findOne({
    verificationTokenHash: tokenHash,
    verificationExpiresAt: { $gt: new Date() },
  });

  if (pendingSignup) {
    const existingUser = await User.findOne({ email: pendingSignup.email });
    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        await User.updateOne(
          { _id: existingUser._id },
          {
            $set: { isEmailVerified: true },
            $unset: {
              emailVerificationTokenHash: 1,
              emailVerificationExpiresAt: 1,
            },
          },
        );
      }
      await PendingSignup.deleteOne({
        _id: pendingSignup._id,
        verificationTokenHash: tokenHash,
      });
      return res.json({
        message: "Your email is verified. You can now sign in.",
      });
    }

    const password = asString(body.password);
    if (!password) {
      return res.json({
        needsPassword: true,
        message: "Your email is verified. Choose a password to finish creating your account.",
      });
    }
    if (!validPassword(password))
      return res.status(400).json({
        message: "Choose a password between 10 and 72 bytes.",
      });

    try {
      await User.create({
        name: pendingSignup.name,
        email: pendingSignup.email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "customer",
        isEmailVerified: true,
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      const existingUser = await User.findOne({
        email: pendingSignup.email,
        isEmailVerified: true,
      });
      if (!existingUser) throw error;
    }

    await PendingSignup.deleteOne({
      _id: pendingSignup._id,
      verificationTokenHash: tokenHash,
    });
    return res.json({
      message: "Your email is verified. You can now sign in.",
    });
  }

  const user = await User.findOneAndUpdate(
    {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
      $or: [
        { isEmailVerified: false },
        { isEmailVerified: { $exists: false } },
      ],
    },
    {
      $set: { isEmailVerified: true },
      $unset: {
        emailVerificationTokenHash: 1,
        emailVerificationExpiresAt: 1,
      },
    },
    { new: true },
  );
  if (!user)
    return res.status(400).json({ message: "This verification link is invalid or expired." });

  res.json({ message: "Your email is verified. You can now sign in." });
});

export const login = asyncHandler(async (req, res) => {
  const body = requestBody(req);
  const user = await User.findOne({
    email: normalizeEmail(body.email),
  }).select("+passwordHash +emailVerificationTokenHash +emailVerificationExpiresAt");
  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(asString(body.password), user.passwordHash))
  ) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (!user.isEmailVerified) {
    const token = newActionToken();
    user.emailVerificationTokenHash = hashToken(token);
    user.emailVerificationExpiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TTL,
    );
    await user.save();
    await sendVerificationEmail({ email: user.email, name: user.name, token });
    return res.status(403).json({
      message: "Verify your email first. A verification link has been sent.",
    });
  }

  res.json(await issueSession(user, res));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(requestBody(req).email);
  if (!validEmail(email))
    return res.status(400).json({ message: "Enter a valid email address." });

  const user = await User.findOne({ email, isEmailVerified: true }).select(
    "+passwordResetTokenHash +passwordResetExpiresAt",
  );
  if (user && user.isActive) {
    const token = newActionToken();
    const tokenHash = hashToken(token);
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL);
    await user.save();
    try {
      await sendPasswordResetEmail({ email: user.email, name: user.name, token });
    } catch (error) {
      await User.updateOne(
        { _id: user._id, passwordResetTokenHash: tokenHash },
        { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } },
      );
      throw error;
    }
  }

  res.json({
    message:
      "If an active account with that verified email exists, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const body = requestBody(req);
  const token = asString(body.token);
  const password = asString(body.password);
  if (!validPassword(password))
    return res.status(400).json({
      message: "Choose a password between 10 and 72 bytes.",
    });
  if (!/^[a-f0-9]{64}$/i.test(token))
    return res.status(400).json({ message: "This password reset link is invalid or expired." });

  const tokenHash = hashToken(token);
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await User.updateOne(
    {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
      isEmailVerified: true,
      isActive: true,
    },
    {
      $set: { passwordHash },
      $unset: {
        passwordResetTokenHash: 1,
        passwordResetExpiresAt: 1,
        refreshTokenHash: 1,
      },
    },
  );
  if (result.matchedCount !== 1)
    return res.status(400).json({ message: "This password reset link is invalid or expired." });

  res.json({ message: "Your password has been reset. You can now sign in." });
});

export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies.refreshToken;
  if (!raw)
    return res.status(401).json({ message: "Refresh session missing." });
  const hash = hashToken(raw);
  const user = await User.findOne({ refreshTokenHash: hash }).select(
    "+refreshTokenHash",
  );
  if (!user || !user.isActive || !user.isEmailVerified)
    return res.status(401).json({ message: "Refresh session invalid." });
  res.json(await issueSession(user, res));
});

export const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies.refreshToken;
  if (raw)
    await User.updateOne(
      { refreshTokenHash: hashToken(raw) },
      { $unset: { refreshTokenHash: 1 } },
    );
  res.clearCookie("refreshToken", {
    ...refreshCookieOptions(),
    maxAge: undefined,
  });
  res.json({ message: "Signed out." });
});

export const me = asyncHandler(async (req, res) =>
  res.json({ user: safeUser(req.user) }),
);
