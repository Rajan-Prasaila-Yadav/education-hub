import AuditLog from "../models/AuditLog.js";

export const logAudit = async ({
  req,
  action,
  entity,
  entityId,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      user: req.user?.id,
      role: req.user?.role,
      action,
      entity,
      entityId,
      metadata,
      ip: req.ip,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};
