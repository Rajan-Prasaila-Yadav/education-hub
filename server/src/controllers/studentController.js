import Attendance from "../models/Attendance.js";
import Note from "../models/Note.js";

import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get student
    const student = await User.findById(studentId).populate("semester");
    if (!student || student.role !== "STUDENT") {
      return res.status(403).json({ message: "Not a student" });
    }

    if (!student.semester) {
      return res.status(400).json({ message: "Student not assigned to semester" });
    }

    // 2. Subjects of semester
    const subjects = await Subject.find({
      semester: student.semester._id,
    }).select("name");

    // 3. Timetable of semester
    const timetable = await Timetable.find({
      semester: student.semester._id,
    })
      .populate("subject", "name")
      .populate("teacher", "name")
      .sort({ day: 1, startTime: 1 });

    res.json({
      semester: student.semester,
      subjects,
      timetable,
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//get notes
export const getNotes = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId).populate("semester");
    if (!student || student.role !== "STUDENT") {
      return res.status(403).json({ message: "Not a student" });
    }

    if (!student.semester) {
      return res.status(400).json({ message: "Student not assigned to semester" });
    }

    // subjects of student's semester
    const subjects = await Subject.find({
      semester: student.semester._id
    }).select("_id");

    const subjectIds = subjects.map(s => s._id);

    // notes only from those subjects + semester
    const notes = await Note.find({
      semester: student.semester._id,
      subject: { $in: subjectIds }
    })
      .populate("subject", "name")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json(notes);

  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId);
    if (!student || !student.semester) {
      return res
        .status(400)
        .json({ message: "Student not assigned to semester" });
    }

    const attendanceDocs = await Attendance.find({
      semester: student.semester,
      "records.student": studentId,
    }).populate("subject", "name");

    const subjectMap = {};

    attendanceDocs.forEach((att) => {
      const record = att.records.find(
        (r) => r.student.toString() === studentId.toString()
      );

      if (!subjectMap[att.subject._id]) {
        subjectMap[att.subject._id] = {
          subject: att.subject.name,
          totalClasses: 0,
          present: 0,
        };
      }

      subjectMap[att.subject._id].totalClasses += 1;

      if (record?.status === "PRESENT") {
        subjectMap[att.subject._id].present += 1;
      }
    });

    const result = Object.values(subjectMap).map((s) => ({
      ...s,
      percentage:
        s.totalClasses === 0
          ? 0
          : Math.round((s.present / s.totalClasses) * 100),
    }));

    res.json(result);
  } catch (err) {
    console.error("Student attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// to fetch today routein
export const getTodayRoutine = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId).select("semester");
    if (!student || !student.semester) {
      return res.status(400).json({ message: "Student not assigned to semester" });
    }

    const day = new Date()
      .toLocaleString("en-US", { weekday: "long" })
      .toUpperCase();

    const routine = await Timetable.find({
      day,
      semester: student.semester,
    })
      .populate("subject", "name")
      .populate("teacher", "name")
      .sort({ startTime: 1 });

    res.json(routine);
  } catch (err) {
    console.error("Student today routine error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAttendanceAnalytics = async (req, res) => {
  try {
    const studentId = req.user.id;

    // student
    const student = await User.findById(studentId).populate("semester");
    if (!student || student.role !== "STUDENT") {
      return res.status(403).json({ message: "Not a student" });
    }

    if (!student.semester) {
      return res.status(400).json({ message: "Student not assigned to semester" });
    }

    // all attendance of student
    const attendanceDocs = await Attendance.find({
      semester: student.semester._id,
      "records.student": studentId
    }).populate("subject", "name");

    const subjectStats = {};
    let totalClasses = 0;
    let totalPresent = 0;

    for (const att of attendanceDocs) {
      const subjectName = att.subject.name;

      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          subject: subjectName,
          total: 0,
          present: 0,
          absent: 0,
          percentage: 0
        };
      }

      const record = att.records.find(
        r => r.student.toString() === studentId
      );

      if (!record) continue;

      subjectStats[subjectName].total += 1;
      totalClasses += 1;

      if (record.status === "PRESENT") {
        subjectStats[subjectName].present += 1;
        totalPresent += 1;
      } else {
        subjectStats[subjectName].absent += 1;
      }
    }

    // percentage calc
    Object.values(subjectStats).forEach(s => {
      s.percentage =
        s.total === 0 ? 0 : Math.round((s.present / s.total) * 100);
    });

    const overallPercentage =
      totalClasses === 0 ? 0 : Math.round((totalPresent / totalClasses) * 100);

    res.json({
      overall: {
        totalClasses,
        present: totalPresent,
        absent: totalClasses - totalPresent,
        percentage: overallPercentage
      },
      subjects: Object.values(subjectStats)
    });

  } catch (err) {
    console.error("Attendance analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
