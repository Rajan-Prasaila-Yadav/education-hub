import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
};

