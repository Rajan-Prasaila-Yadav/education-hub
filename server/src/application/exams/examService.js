import Exam from "../../models/Exam.js";
import Result from "../../models/Result.js";
import Subject from "../../models/Subject.js";
import Semester from "../../models/Semester.js";
import User from "../../models/User.js";
import { HttpError } from "../../shared/errors/HttpError.js";

function computePassMarks({ maxMarks, passMarks }) {
  if (passMarks != null) return Number(passMarks);
  return Math.ceil(Number(maxMarks) * 0.4);
}

export async function createExam({ actor, payload }) {
  const { title, subjectId, semesterId, maxMarks, passMarks } = payload;

  if (!title || !subjectId || !semesterId || maxMarks == null) {
    throw new HttpError(400, "All fields are required");
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) throw new HttpError(400, "Invalid subject");

  const semester = await Semester.findById(semesterId);
  if (!semester) throw new HttpError(400, "Invalid semester");

  if (!subject.teacher) throw new HttpError(403, "No teacher assigned to subject");
  if (String(subject.teacher) !== String(actor.id)) {
    throw new HttpError(403, "Teacher not assigned to subject");
  }

  const computedPassMarks = computePassMarks({ maxMarks, passMarks });

  const exam = await Exam.create({
    title,
    subject: subjectId,
    semester: semesterId,
    maxMarks: Number(maxMarks),
    passMarks: computedPassMarks,
    createdBy: actor.id,
  });

  return exam;
}

export async function upsertResult({ actor, payload }) {
  const { examId, studentId, marks } = payload;

  if (!examId || !studentId || marks == null) {
    throw new HttpError(400, "examId, studentId and marks are required");
  }

  const exam = await Exam.findById(examId);
  if (!exam) throw new HttpError(404, "Exam not found");

  if (String(exam.createdBy) !== String(actor.id)) {
    throw new HttpError(403, "Not your exam");
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== "STUDENT") {
    throw new HttpError(400, "Invalid student");
  }

  const numericMarks = Number(marks);
  if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > exam.maxMarks) {
    throw new HttpError(400, "Invalid marks");
  }

  const pass = computePassMarks({ maxMarks: exam.maxMarks, passMarks: exam.passMarks });
  const status = numericMarks >= pass ? "PASS" : "FAIL";

  const result = await Result.findOneAndUpdate(
    { exam: examId, student: studentId },
    { $set: { marks: numericMarks, status } },
    { upsert: true, new: true }
  );

  return { exam, result };
}

export async function bulkUpsertResults({ actor, payload }) {
  const { examId, marks } = payload;

  const exam = await Exam.findById(examId).populate("subject");
  if (!exam || String(exam.createdBy) !== String(actor.id)) {
    throw new HttpError(403, "Not your exam");
  }

  if (!Array.isArray(marks)) throw new HttpError(400, "marks must be an array");

  const pass = computePassMarks({ maxMarks: exam.maxMarks, passMarks: exam.passMarks });

  let savedCount = 0;
  const notifiedStudentIds = [];

  for (const m of marks) {
    const student = await User.findById(m.studentId);
    if (!student || student.role !== "STUDENT") continue;

    const numericMarks = Number(m.marksObtained);
    if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > exam.maxMarks) continue;

    const status = numericMarks >= pass ? "PASS" : "FAIL";
    await Result.findOneAndUpdate(
      { exam: examId, student: student._id },
      { $set: { marks: numericMarks, status } },
      { upsert: true, new: true }
    );

    savedCount += 1;
    notifiedStudentIds.push(student._id);
  }

  return { exam, savedCount, notifiedStudentIds };
}

export async function listStudentResults({ userId }) {
  const results = await Result.find({ student: userId })
    .populate({
      path: "exam",
      populate: { path: "subject", select: "name" },
    })
    .sort({ createdAt: -1 });

  return results.map((r) => ({
    exam: r.exam?.title,
    subject: r.exam?.subject?.name,
    marksObtained: r.marks,
    maxMarks: r.exam?.maxMarks,
    status: r.status,
    percentage: r.exam?.maxMarks ? Math.round((r.marks / r.exam.maxMarks) * 100) : 0,
  }));
}

