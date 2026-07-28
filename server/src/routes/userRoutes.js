// server/src/routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { createUserByAdmin, listUsers } from "../controllers/userController.js";
import { requireCollegeContext } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// ✅ Added TEACHER so they can list students in their semester for attendance
router.get(
  "/",
  protect,
  checkSubscription,
  allowRoles("SUPER_ADMIN", "COLLEGE_ADMIN", "TEACHER"),
  requireCollegeContext,
  listUsers
);

router.post(
  "/create",
  protect,
  checkSubscription,
  allowRoles("SUPER_ADMIN", "COLLEGE_ADMIN"),
  requireCollegeContext,
  [
    body("name").isString().trim().notEmpty(),
    body("email").isEmail(),
    body("role").isString().notEmpty(),
    body("college").optional().isString().notEmpty(),
    validate,
  ],
  createUserByAdmin
);

export default router;