import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { getAuditLogs } from "../controllers/auditController.js";
import { checkSubscription } from "../middleware/checkSubscription.js";

const router = express.Router();

router.get(
  "/",
  protect,
  checkSubscription,
  allowRoles("SUPER_ADMIN"),
  getAuditLogs
);

export default router;
