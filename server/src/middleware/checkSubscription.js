import College from "../models/College.js";
import Subscription from "../models/Subscription.js";

/**
 * Ensures a college has a subscription document and returns it (plain object or doc).
 */
export async function ensureSubscriptionForCollege(collegeId) {
  const college = await College.findById(collegeId);
  if (!college) return null;

  if (college.subscription) {
    const existing = await Subscription.findById(college.subscription);
    if (existing) return existing;
  }

  const existingByCollege = await Subscription.findOne({ college: collegeId });
  if (existingByCollege) {
    college.subscription = existingByCollege._id;
    await college.save();
    return existingByCollege;
  }

  try {
    const sub = await Subscription.create({
      college: collegeId,
      plan: "FREE",
      status: "ACTIVE",
    });
    college.subscription = sub._id;
    await college.save();
    return sub;
  } catch (e) {
    if (e?.code === 11000) {
      const sub = await Subscription.findOne({ college: collegeId });
      if (sub) {
        college.subscription = sub._id;
        await college.save();
        return sub;
      }
    }
    throw e;
  }
}

function subscriptionIsValid(sub) {
  if (!sub) return false;
  if (sub.status === "EXPIRED") return false;
  if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
    return false;
  }
  return true;
}

/**
 * FREE plan: block premium-only endpoints (path-based, no layout changes).
 */
function freePlanBlocksRequest(req) {
  const path = (req.baseUrl || "") + (req.path || "");
  const method = req.method.toUpperCase();

  if (method === "POST" && path.includes("/exams/upload-marks")) {
    return {
      message: "Bulk marks upload requires PRO or ENTERPRISE plan",
      code: "PLAN_FREE_LIMIT",
    };
  }
  if (method === "GET" && path.includes("/admin/semester-report")) {
    return {
      message: "Semester attendance reports require PRO or ENTERPRISE plan",
      code: "PLAN_FREE_LIMIT",
    };
  }
  if (method === "GET" && path.includes("/admin/dashboard-stats")) {
    return {
      message: "Admin analytics dashboard requires PRO or ENTERPRISE plan",
      code: "PLAN_FREE_LIMIT",
    };
  }
  if (method === "GET" && path.includes("/student/attendance/analytics")) {
    return {
      message: "Attendance analytics requires PRO or ENTERPRISE plan",
      code: "PLAN_FREE_LIMIT",
    };
  }
  return null;
}

/**
 * After `protect`: blocks expired subscriptions; applies FREE plan route limits.
 * SUPER_ADMIN: no-op (no college billing gate).
 */
export const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user) return next();

    if (req.user.role === "SUPER_ADMIN") {
      req.subscriptionContext = { skipped: true };
      return next();
    }

    const collegeId = req.user.college;
    if (!collegeId) {
      return res.status(403).json({ message: "No college assigned to this account" });
    }

    const sub = await ensureSubscriptionForCollege(collegeId);
    if (!sub) {
      return res.status(404).json({ message: "College not found" });
    }

    if (!subscriptionIsValid(sub)) {
      return res.status(402).json({
        message: "Subscription expired or inactive. Please renew to continue.",
        code: "SUBSCRIPTION_EXPIRED",
      });
    }

    if (sub.plan === "FREE") {
      const block = freePlanBlocksRequest(req);
      if (block) {
        return res.status(403).json(block);
      }
    }

    req.subscription = {
      plan: sub.plan,
      status: sub.status,
      expiresAt: sub.expiresAt,
      id: sub._id.toString(),
    };

    next();
  } catch (err) {
    console.error("checkSubscription error:", err.message);
    return res.status(500).json({ message: "Subscription check failed" });
  }
};
