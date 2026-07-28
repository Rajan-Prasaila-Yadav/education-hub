import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },

  // 🔥 ADD THIS
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true
  }

}, { timestamps: true });

export default mongoose.model("Semester", semesterSchema);
