import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { assignStudentSemester,getSemesterReport } from "../controllers/adminController.js";
import { getAdminDashboardStats } from "../controllers/adminAnalyticsController.js";
import { requireCollegeContext, requireSameCollege } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate.js";
import {
  createCollege,
  createDepartment,
  createSemester,
  createSubject,
  listColleges,
  listDepartments,
  listSemesters,
  listSubjects
} from "../controllers/adminController.js";

const router = express.Router();

router.post(
  "/college",
  protect,
  checkSubscription,
  allowRoles("SUPER_ADMIN"),
  [body("name").isString().trim().notEmpty(), body("address").isString().trim().notEmpty(), validate],
  createCollege
);

router.get(
  "/colleges",
  protect,
  checkSubscription,
  allowRoles("SUPER_ADMIN"),
  listColleges
);

router.post(
  "/semester",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  [body("name").isString().trim().notEmpty(), body("department").isString().notEmpty(), validate],
  createSemester
);

router.post(
  "/subject",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  [body("name").isString().trim().notEmpty(), body("semester").isString().notEmpty(), validate],
  createSubject
);

router.get(
  "/departments",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN", "SUPER_ADMIN"),
  requireCollegeContext,
  listDepartments
);

router.get(
  "/semesters",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN", "SUPER_ADMIN"),
  requireCollegeContext,
  listSemesters
);

router.get(
  "/subjects",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN", "SUPER_ADMIN"),
  requireCollegeContext,
  listSubjects
);


router.post(
  "/assign-student-semester",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  [body("studentId").isString().notEmpty(), body("semesterId").isString().notEmpty(), validate],
  assignStudentSemester
);



router.get(
  "/dashboard-stats",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  getAdminDashboardStats
);

router.post(
  "/department",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  requireSameCollege,
  [body("name").isString().trim().notEmpty(), body("college").optional().isString().notEmpty(), validate],
  createDepartment
);

router.get(
  "/semester-report/:semesterId",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  [param("semesterId").isString().notEmpty(), validate],
  getSemesterReport
);


export default router;
