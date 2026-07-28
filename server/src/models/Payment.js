import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    provider: {
      type: String,
      enum: ["RAZORPAY", "STRIPE"],
      required: true,
    },
    transactionId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
