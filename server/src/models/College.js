import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true },
    address: String,
    isActive: { type: Boolean, default: true },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("College", collegeSchema);
