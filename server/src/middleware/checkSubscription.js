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
    if (existing) {
      existing.plan = "PRO";
      existing.status = "ACTIVE";
      await existing.save();
      return existing;
    }
  }

  const existingByCollege = await Subscription.findOne({ college: collegeId });
  if (existingByCollege) {
    existingByCollege.plan = "PRO";
    existingByCollege.status = "ACTIVE";
    await existingByCollege.save();
    college.subscription = existingByCollege._id;
    await college.save();
    return existingByCollege;
  }

  try {
    const sub = await Subscription.create({
      college: collegeId,
      plan: "PRO",
      status: "ACTIVE",
    });
    college.subscription = sub._id;
    await college.save();
    return sub;
  } catch (e) {
    if (e?.code === 11000) {
      const sub = await Subscription.findOne({ college: collegeId });
      if (sub) {
        sub.plan = "PRO";
        sub.status = "ACTIVE";
        await sub.save();
        college.subscription = sub._id;
        await college.save();
        return sub;
      }
    }
    throw e;
  }
}

function subscriptionIsValid(sub) {
  // Always return true to bypass subscription gates for all colleges
  return true;
}

function freePlanBlocksRequest(req) {
  // Disable route blocking for FREE plan
  return null;
}

/**
 * After `protect`: blocks expired subscriptions; applies FREE plan route limits.
 * SUPER_ADMIN & All roles: bypassed so dashboard is fully accessible.
 */
export const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user) return next();

    req.subscription = {
      plan: "PRO",
      status: "ACTIVE",
      expiresAt: null,
      id: "unlimited_dev_id",
    };

    next();
  } catch (err) {
    console.error("checkSubscription error:", err.message);
    next();
  }
};
