import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { requireCollegeContext, requireSemesterContext } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import {
  createTimetable,
  listTimetable,
  getTeacherToday,
  getStudentToday,
} from "../controllers/timetableController.js";

const router = express.Router();

// Admin lists timetable (COLLEGE_ADMIN: own college)
router.get(
  "/",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  listTimetable
);

// Admin creates timetable
router.post(
  "/create",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  [
    body("subject").isString().notEmpty(),
    body("semester").isString().notEmpty(),
    body("teacher").isString().notEmpty(),
    body("day").isString().notEmpty(),
    body("startTime").isString().notEmpty(),
    body("endTime").isString().notEmpty(),
    validate,
  ],
  createTimetable
);

// Teacher today schedule
router.get(
  "/teacher/today",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  getTeacherToday
);

// Student today routine
router.get(
  "/student/today",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireCollegeContext,
  requireSemesterContext,
  getStudentToday
);

export default router;
