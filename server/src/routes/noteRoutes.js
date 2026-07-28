// server/src/routes/noteRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import upload from "../config/multer.js";
import { requireCollegeContext } from "../middleware/tenant.js";
import { checkSubscription } from "../middleware/checkSubscription.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { uploadNote, getNotes } from "../controllers/noteController.js";

const router = express.Router();

// ✅ FIX: upload.single("file") MUST come BEFORE express-validator body() checks.
// With multipart/form-data, multer parses req.body. If validators run first,
// req.body is empty and every field fails — causing "Invalid request data".
router.post(
  "/upload",
  protect,
  checkSubscription,
  allowRoles("TEACHER"),
  requireCollegeContext,
  upload.single("file"),          // ← parse multipart FIRST
  [                               // ← THEN validate the now-populated req.body
    body("title").isString().trim().notEmpty(),
    body("subjectId").isString().notEmpty(),
    body("semesterId").isString().notEmpty(),
    validate,
  ],
  uploadNote
);

// Student views notes
router.get(
  "/",
  protect,
  checkSubscription,
  allowRoles("STUDENT"),
  requireCollegeContext,
  getNotes
);

export default router;