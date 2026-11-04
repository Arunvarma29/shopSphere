import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  me,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
const router = Router();
const createAuthLimiter = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." },
  });
const registrationLimiter = createAuthLimiter(5);
const loginLimiter = createAuthLimiter(10);
const accountEmailLimiter = createAuthLimiter(5);
const tokenActionLimiter = createAuthLimiter(10);

router.post("/register", registrationLimiter, register);
router.post("/verify-email", tokenActionLimiter, verifyEmail);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", accountEmailLimiter, forgotPassword);
router.post("/reset-password", tokenActionLimiter, resetPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);
export default router;
