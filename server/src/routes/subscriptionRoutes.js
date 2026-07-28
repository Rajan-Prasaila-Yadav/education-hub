import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { requireCollegeContext } from "../middleware/tenant.js";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate.js";
import {
  listCollegesWithSubscriptions,
  getRevenueSummary,
  updateSubscriptionManual,
  getMyCollegeSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// ── Super Admin (all colleges / billing) ─────────────────────────────
router.get(
  "/admin/colleges",
  protect,
  allowRoles("SUPER_ADMIN"),
  listCollegesWithSubscriptions
);

router.get(
  "/admin/revenue",
  protect,
  allowRoles("SUPER_ADMIN"),
  getRevenueSummary
);

router.patch(
  "/admin/college/:collegeId",
  protect,
  allowRoles("SUPER_ADMIN"),
  [
    param("collegeId").isMongoId(),
    body("plan").optional().isIn(["FREE", "PRO", "ENTERPRISE"]),
    body("status").optional().isIn(["ACTIVE", "EXPIRED", "TRIAL"]),
    body("expiresAt").optional({ nullable: true }),
    body("paymentId").optional().isString(),
    body("amount").optional().isNumeric(),
    body("provider").optional().isIn(["RAZORPAY", "STRIPE"]),
    body("transactionId").optional().isString(),
    body("paymentStatus").optional().isIn(["COMPLETED", "FAILED"]),
    validate,
  ],
  updateSubscriptionManual
);

// ── College Admin — own college only ────────────────────────────────
router.get(
  "/college/me",
  protect,
  allowRoles("COLLEGE_ADMIN"),
  requireCollegeContext,
  getMyCollegeSubscription
);

export default router;
