import { notifyStudent } from "../utils/notify.js";
import {
  createExam as createExamUseCase,
  upsertResult,
  bulkUpsertResults,
  listStudentResults,
} from "../application/exams/examService.js";

export const createExam = async (req, res) => {
  try {
    const exam = await createExamUseCase({ actor: req.user, payload: req.body });

    res.status(201).json({
      message: "Exam created successfully",
      exam,
    });
  } catch (err) {
    console.error("Create exam error:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
};


// Teacher/Admin: enter marks
export const enterMarks = async (req, res) => {
  try {
    const { exam, result } = await upsertResult({ actor: req.user, payload: req.body });

    await notifyStudent({
      studentId: req.body.studentId,
      title: "Exam Result Published",
      message: `Your result for ${exam.title} has been published`,
      type: "RESULT",
    });

    res.json({ message: "Marks saved", result });
  } catch (err) {
    console.error("Enter marks error:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
};

//results
export const getStudentResults = async (req, res) => {
  try {
    const response = await listStudentResults({ userId: req.user.id });
    res.json(response);

  } catch (err) {
    console.error("Student results error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const uploadMarks = async (req, res) => {
  try {
    const { exam, savedCount, notifiedStudentIds } = await bulkUpsertResults({
      actor: req.user,
      payload: req.body,
    });

    res.json({
      message: "Marks uploaded successfully",
      count: savedCount,
    });

    // fire-and-forget notifications (best effort)
    for (const studentId of notifiedStudentIds) {
      await notifyStudent({
        studentId,
        title: "Exam Result Published",
        message: `Your result for ${exam.title} has been published`,
        type: "RESULT",
      });
    }

  } catch (err) {
    console.error("Upload marks error:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
};

// Teacher: list exams created by me
export const getMyExams = async (req, res) => {
  try {
    const { default: Exam } = await import("../models/Exam.js");

    const exams = await Exam.find({ createdBy: req.user.id })
      .populate("subject", "name")
      .populate("semester", "name")
      .sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    console.error("Get my exams error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Teacher: get results for an exam I created
export const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { default: Exam } = await import("../models/Exam.js");
    const { default: Result } = await import("../models/Result.js");

    const exam = await Exam.findById(examId).populate("subject", "name");
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    if (String(exam.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not your exam" });
    }

    const results = await Result.find({ exam: examId })
      .populate("student", "name email")
      .sort({ marks: -1 });

    res.json({ exam, results });
  } catch (err) {
    console.error("Get exam results error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
