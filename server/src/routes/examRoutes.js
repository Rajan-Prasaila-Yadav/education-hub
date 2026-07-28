import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { requireCollegeContext, requireSemesterContext } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import {
  createExam,
  enterMarks,
  uploadMarks,
  getStudentResults,
  getMyExams,
  getExamResults,
} from "../controllers/examController.js";

const router = express.Router();

/**
 * ✅ Create exam
 * Teacher creates exam for their subject
 * (Optional: allow COLLEGE_ADMIN too if you want)
 */
router.post(
  "/create",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  [
    body("title").isString().trim().notEmpty(),
    body("subjectId").isString().notEmpty(),
    body("semesterId").isString().notEmpty(),
    body("maxMarks").isNumeric(),
    body("passMarks").optional().isNumeric(),
    validate,
  ],
  createExam
);

/**
 * ✅ Teacher uploads/enters marks
 */
router.post(
  "/marks",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  [body("examId").isString().notEmpty(), body("studentId").isString().notEmpty(), body("marks").isNumeric(), validate],
  enterMarks
);

/**
 * (Optional separate endpoint if you want file-based marks upload)
 */
router.post(
  "/upload-marks",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  [body("examId").isString().notEmpty(), body("marks").isArray({ min: 1 }), validate],
  uploadMarks
);

/**
 * ✅ Student views own results
 */
router.get(
  "/my-results",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireCollegeContext,
  requireSemesterContext,
  getStudentResults
);

// Teacher: list my exams
router.get(
  "/mine",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  getMyExams
);

// Teacher: exam results
router.get(
  "/:examId/results",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  getExamResults
);

export default router;
