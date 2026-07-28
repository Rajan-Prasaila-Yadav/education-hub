import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";


export const assignTeacher = async (req, res) => {
  try {
    const { subjectId, teacherId } = req.body;

    const subject = await Subject.findById(subjectId)
      .populate({
        path: "semester",
        populate: { path: "department", populate: { path: "college" } }
      });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "TEACHER") {
      return res.status(400).json({ message: "Invalid teacher" });
    }

    if (
      teacher.college.toString() !== subject.semester.department.college._id.toString()
    ) {
      return res.status(403).json({ message: "Cross-college assignment blocked" });
    }

    subject.teacher = teacherId;
    await subject.save();

    res.json({ message: "Teacher assigned successfully" });
  } catch (err) {
    console.error("Assign teacher error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTodayClasses = async (req, res) => {
  const day = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toUpperCase();

  const classes = await Timetable.find({
    day,
    teacher: req.user.id,
  })
    .populate("subject", "name")
    .populate("semester", "name")
    .sort({ startTime: 1 });

  res.json(classes);
};

export const getTeacherDashboard = async (req, res) => {
  const day = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toUpperCase();

  const todayClasses = await Timetable.find({
    day,
    teacher: req.user.id,
  })
    .populate("subject", "name")
    .populate("semester", "name")
    .sort({ startTime: 1 });

  // ✅ FIX: populate semester so frontend can derive semester list from subjects
  const subjects = await Subject.find({
    teacher: req.user.id,
  }).populate("semester", "name");   // was: .select("name") — semester was never sent

  res.json({
    subjects,
    todayClasses,
  });
};

export const getSubjectReport = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject || String(subject.teacher) !== String(teacherId)) {
      return res.status(403).json({ message: "Not your subject" });
    }

    const records = await Attendance.find({ subject: subjectId })
      .populate("records.student", "name email")
      .sort({ date: 1 });

    const studentStats = {};

    records.forEach((att) => {
      att.records.forEach((r) => {
        const id = r.student._id.toString();

        if (!studentStats[id]) {
          studentStats[id] = {
            student: r.student,
            total: 0,
            present: 0,
          };
        }

        studentStats[id].total++;
        if (r.status === "PRESENT") studentStats[id].present++;
      });
    });

    const report = Object.values(studentStats).map((s) => ({
      student: s.student,
      totalClasses: s.total,
      present: s.present,
      percentage:
        s.total === 0 ? 0 : Math.round((s.present / s.total) * 100),
    }));

    res.json({
      subject: subject.name,
      report,
    });

  } catch (err) {
    console.error("Subject report error:", err);
    res.status(500).json({ message: "Server error" });
  }
};