import jwt from "jsonwebtoken";
import crypto from "node:crypto";
export const signAccess = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" },
  );
export const newRefreshToken = () => crypto.randomBytes(48).toString("hex");
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/api/auth",
  maxAge: Number(process.env.REFRESH_TOKEN_DAYS || 7) * 86400000,
});
