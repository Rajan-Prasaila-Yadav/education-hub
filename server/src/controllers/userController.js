// server/src/controllers/userController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const listUsers = async (req, res) => {
  try {
    const { role, college, semester, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (req.user.role === "COLLEGE_ADMIN") {
      if (!req.user.college) {
        return res.status(400).json({ message: "College context missing" });
      }
      filter.college = req.user.college;
    } else if (req.user.role === "TEACHER") {
      // ✅ Teachers scoped to their own college — can only list students
      if (!req.user.college) {
        return res.status(400).json({ message: "College context missing" });
      }
      filter.college = req.user.college;
      // Teachers can only fetch STUDENT role — prevent listing other teachers/admins
      if (role && role !== "STUDENT") {
        return res.status(403).json({ message: "Teachers can only list students" });
      }
      filter.role = "STUDENT"; // force STUDENT even if no role param sent
    } else if (req.user.role === "SUPER_ADMIN" && college) {
      filter.college = college;
    }

    if (req.user.role !== "TEACHER" && role) filter.role = role;
    if (semester) filter.semester = semester;
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const skip =
      (Math.max(1, parseInt(page, 10)) - 1) *
      Math.min(100, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email role college semester isActive createdAt")
        .populate("college", "name code")
        .populate("semester", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page, 10) || 1,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, role, college } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let allowedRoles = [];
    if (req.user.role === "SUPER_ADMIN") allowedRoles = ["COLLEGE_ADMIN"];
    if (req.user.role === "COLLEGE_ADMIN") allowedRoles = ["TEACHER", "STUDENT"];

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Invalid role" });
    }

    if (role === "COLLEGE_ADMIN" && !college) {
      return res.status(400).json({ message: "College is required for COLLEGE_ADMIN" });
    }
    if ((role === "TEACHER" || role === "STUDENT") && !college) {
      return res.status(400).json({ message: "College is required for TEACHER and STUDENT" });
    }

    if (req.user.role === "COLLEGE_ADMIN") {
      if (!req.user.college) {
        return res.status(400).json({ message: "Admin has no college assigned" });
      }
      if (String(college) !== String(req.user.college)) {
        return res.status(403).json({ message: "Cross-college user creation denied" });
      }
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const defaultPassword = "password123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      college,
      isActive: true,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
      },
      defaultPassword,
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};