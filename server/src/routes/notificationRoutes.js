import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { requireCollegeContext } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import {
  createNotification,
  getMyNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Admin announcement
router.post(
  "/create",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  [body("title").isString().trim().notEmpty(), body("message").isString().trim().notEmpty(), validate],
  createNotification
);

// Get notifications for logged-in user
router.get(
  "/my",
  protect,
  checkSubscription,
  allowRoles("STUDENT", "TEACHER"),
  getMyNotifications
);

// Mark notification as read
router.patch(
  "/read/:id",
  protect,
  checkSubscription,
  allowRoles("STUDENT", "TEACHER"),
  markAsRead
);

export default router;