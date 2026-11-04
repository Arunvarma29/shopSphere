import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false, index: true },
    emailVerificationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false, index: true },
    passwordResetExpiresAt: { type: Date, select: false },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      immutable: true,
    },
    isActive: { type: Boolean, default: true },
    refreshTokenHash: { type: String, select: false },
    addresses: [
      {
        label: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        phone: String,
      },
    ],
  },
  { timestamps: true },
);
export default mongoose.model("User", userSchema);
