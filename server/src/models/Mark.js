import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
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
    marksObtained: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Mark", markSchema);
