import express from "express";
import {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";


const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password too short"),
    validate,
  ],
  login
);

router.post(
  "/change-password",
  protect,
  [
    body("currentPassword").isString().notEmpty(),
    body("newPassword").isLength({ min: 6 }).withMessage("Password too short"),
    validate,
  ],
  changePassword
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email required"), validate],
  forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").isString().notEmpty(),
    body("newPassword").isLength({ min: 6 }).withMessage("Password too short"),
    validate,
  ],
  resetPassword
);

router.post("/debug-create-user", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Not allowed in production" });
  }

  const { name,email, password, role } = req.body;
  const bcrypt = (await import("bcryptjs")).default;
  const User = (await import("../models/User.js")).default;

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashed,
    role,
    isActive: true,
  });

  res.json({ message: "User created", email });
});

export default router;
