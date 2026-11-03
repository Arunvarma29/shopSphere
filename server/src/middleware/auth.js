import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({ message: "Authentication required." });
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res
      .status(401)
      .json({ message: "Session expired. Please sign in again." });
  }
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive)
    return res.status(401).json({ message: "Account unavailable." });
  req.user = user;
  next();
});
// Authorization is enforced by the API, never just by hiding frontend links.
export const requireAdmin = (req, res, next) =>
  req.user?.role === "admin"
    ? next()
    : res.status(403).json({ message: "Administrator permission required." });
