import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["PRESENT", "ABSENT"],
    required: true,
  },
});

const attendanceSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      required: true,
    },
    records: [attendanceRecordSchema],
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Teacher
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
