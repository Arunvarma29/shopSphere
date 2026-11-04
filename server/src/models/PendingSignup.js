import mongoose from "mongoose";

const pendingSignupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    verificationTokenHash: { type: String, required: true, unique: true },
    verificationExpiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PendingSignup", pendingSignupSchema);
