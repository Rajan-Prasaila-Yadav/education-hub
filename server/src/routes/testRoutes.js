import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { checkSubscription } from "../middleware/checkSubscription.js";

const router = express.Router();

router.get(
  "/admin-only",
  protect,
  checkSubscription,
  allowRoles("COLLEGE_ADMIN"),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

export default router;
