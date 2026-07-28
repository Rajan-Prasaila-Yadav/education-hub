import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { requireCollegeContext } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";
import {
  assignTeacher,
  getTodayClasses,
  getTeacherDashboard,
  getSubjectReport
} from "../controllers/teacherController.js";

const router = express.Router();

// Teacher dashboard
router.get(
  "/dashboard",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  getTeacherDashboard
);

// Assign teacher to subject (College Admin)
router.post(
  "/assign-subject",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  assignTeacher
);

// Teacher: today’s classes
router.get(
  "/today",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  getTodayClasses
);

// Subject attendance report
router.get(
  "/subject-report/:subjectId",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  getSubjectReport
);

export default router;
