import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { getAttendance, getNotes,getStudentDashboard,getAttendanceAnalytics } from "../controllers/studentController.js";
import { getTodayRoutine } from "../controllers/studentController.js";
import { requireSemesterContext } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";


const router = express.Router();

//get dashboard

router.get(
  "/dashboard",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireSemesterContext,
  getStudentDashboard
);

//get attendence
router.get(
  "/attendance",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireSemesterContext,
  getAttendance
);
//get notes
router.get(
  "/notes",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireSemesterContext,
  getNotes
);

//get attendence


router.get(
  "/today",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireSemesterContext,
  getTodayRoutine
);




router.get(
  "/attendance/analytics",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireSemesterContext,
  getAttendanceAnalytics
);

export default router;