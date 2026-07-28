// server/src/routes/attendanceRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { requireCollegeContext, requireSemesterContext } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import {
  markAttendance,
  getMyAttendance,
  getAttendanceStats,
  getTodayStatus,       // ✅ new
} from "../controllers/attendanceController.js";

const router = express.Router();

// Teacher marks attendance
router.post(
  "/mark",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  [
    body("subjectId").isString().notEmpty(),
    body("semesterId").isString().notEmpty(),
    body("date").notEmpty(),
    body("records").isArray({ min: 1 }),
    validate,
  ],
  markAttendance
);

// ✅ Teacher: check which subject+date combos are already marked today
router.get(
  "/today-status",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  getTodayStatus
);

// Student views attendance
router.get(
  "/my",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireCollegeContext,
  requireSemesterContext,
  getMyAttendance
);

router.get(
  "/stats",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireCollegeContext,
  requireSemesterContext,
  getAttendanceStats
);

export default router;