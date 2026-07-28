import mongoose from "mongoose";
const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    maxMarks: { type: Number, required: true },
    // optional: defaults to 40% of maxMarks if not provided
    passMarks: { type: Number },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Teacher
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
