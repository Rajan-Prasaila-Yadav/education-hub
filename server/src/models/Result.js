import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    marks: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PASS", "FAIL"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
