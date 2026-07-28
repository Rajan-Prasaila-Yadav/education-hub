import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import Semester from "../models/Semester.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    const collegeFilter =
      req.user.role === "COLLEGE_ADMIN" ? { college: req.user.college } : {};

    const semIds =
      req.user.role === "COLLEGE_ADMIN"
        ? (await Semester.find({ college: req.user.college }).select("_id")).map((s) => s._id)
        : null;

    // Users
    const totalStudents = await User.countDocuments({ role: "STUDENT", ...collegeFilter });
    const totalTeachers = await User.countDocuments({ role: "TEACHER", ...collegeFilter });

    // Exams
    // Exam doesn't store college directly; scope via semester if college admin
    const totalExams =
      req.user.role === "COLLEGE_ADMIN"
        ? await Exam.countDocuments({ semester: { $in: semIds } })
        : await Exam.countDocuments();

    // Attendance aggregation
    const attendanceRecords =
      req.user.role === "COLLEGE_ADMIN"
        ? await Attendance.find({ semester: { $in: semIds } })
        : await Attendance.find();

    let totalMarks = 0;
    let presentMarks = 0;

    attendanceRecords.forEach((a) => {
      a.records.forEach((r) => {
        totalMarks++;
        if (r.status === "PRESENT") presentMarks++;
      });
    });

    const avgAttendance = totalMarks
      ? Math.round((presentMarks / totalMarks) * 100)
      : 0;

    // Results aggregation
    // Result doesn't store college directly; scope via exams in tenant college
    const examIds =
      semIds
        ? (await Exam.find({ semester: { $in: semIds } }).select("_id")).map((e) => e._id)
        : null;

    const passCount = await Result.countDocuments(
      examIds ? { status: "PASS", exam: { $in: examIds } } : { status: "PASS" }
    );
    const failCount = await Result.countDocuments(
      examIds ? { status: "FAIL", exam: { $in: examIds } } : { status: "FAIL" }
    );

    res.json({
      users: {
        students: totalStudents,
        teachers: totalTeachers,
      },
      academics: {
        totalExams,
        avgAttendance,
        results: {
          pass: passCount,
          fail: failCount,
        },
      },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
