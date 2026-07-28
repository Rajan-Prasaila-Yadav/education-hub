import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: String,
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
