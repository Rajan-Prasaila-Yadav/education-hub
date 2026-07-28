import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = auth.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated" });
    }

    // attach fresh user (not token data)
    // NOTE: keep both `id` and `_id` for backward compatibility across controllers.
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      role: user.role,
      college: user.college,
      semester: user.semester,
    };
    // tenant context (null for SUPER_ADMIN)
    req.collegeId = user.role === "SUPER_ADMIN" ? null : user.college;

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
