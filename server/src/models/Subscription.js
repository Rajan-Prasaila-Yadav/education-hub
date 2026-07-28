import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "TRIAL"],
      default: "ACTIVE",
    },
    expiresAt: { type: Date, default: null },
    paymentId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
