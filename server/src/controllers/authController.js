import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signAccess,
  newRefreshToken,
  hashToken,
  refreshCookieOptions,
} from "../utils/tokens.js";
const safeUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});
const issueSession = async (user, res) => {
  const refresh = newRefreshToken();
  user.refreshTokenHash = hashToken(refresh);
  await user.save();
  res.cookie("refreshToken", refresh, refreshCookieOptions());
  return { accessToken: signAccess(user), user: safeUser(user) };
};
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 10)
    return res
      .status(400)
      .json({
        message:
          "Name, valid email and password (10+ characters) are required.",
      });
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "customer",
  }); // Public sign-up can never grant admin rights.
  res.status(201).json(await issueSession(user, res));
});
export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    email: String(req.body.email || "").toLowerCase(),
  }).select("+passwordHash");
  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(req.body.password || "", user.passwordHash))
  )
    return res.status(401).json({ message: "Invalid email or password." });
  res.json(await issueSession(user, res));
});
export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies.refreshToken;
  if (!raw)
    return res.status(401).json({ message: "Refresh session missing." });
  const hash = hashToken(raw);
  const user = await User.findOne({ refreshTokenHash: hash }).select(
    "+refreshTokenHash",
  );
  if (!user || !user.isActive)
    return res.status(401).json({ message: "Refresh session invalid." });
  res.json(await issueSession(user, res)); // Rotate refresh tokens on every use.
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
