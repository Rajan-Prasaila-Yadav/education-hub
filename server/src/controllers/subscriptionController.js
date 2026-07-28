import mongoose from "mongoose";
import College from "../models/College.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import { ensureSubscriptionForCollege } from "../middleware/checkSubscription.js";
import { logAudit } from "../utils/AuditLogger.js";

/**
 * SUPER_ADMIN — all colleges with subscription status
 */
export const listCollegesWithSubscriptions = async (req, res) => {
  try {
    const colleges = await College.find()
      .populate("subscription")
      .sort({ createdAt: -1 })
      .lean();

    const payload = await Promise.all(
      colleges.map(async (c) => {
        let sub = c.subscription;
        if (!sub) {
          const created = await ensureSubscriptionForCollege(c._id);
          sub = created
            ? {
                _id: created._id,
                plan: created.plan,
                status: created.status,
                expiresAt: created.expiresAt,
                paymentId: created.paymentId,
              }
            : null;
        }
        return {
          _id: c._id,
          name: c.name,
          code: c.code,
          address: c.address,
          isActive: c.isActive,
          createdAt: c.createdAt,
          subscription: sub
            ? {
                _id: sub._id,
                plan: sub.plan,
                status: sub.status,
                expiresAt: sub.expiresAt,
                paymentId: sub.paymentId,
              }
            : null,
        };
      })
    );

    res.json(payload);
  } catch (err) {
    console.error("listCollegesWithSubscriptions:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * SUPER_ADMIN — revenue summary from completed payments
 */
export const getRevenueSummary = async (req, res) => {
  try {
    const [agg] = await Payment.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const byProvider = await Payment.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: "$provider",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalRevenue: agg?.totalRevenue ?? 0,
      paymentCount: agg?.count ?? 0,
      byProvider: byProvider.map((r) => ({
        provider: r._id,
        total: r.total,
        count: r.count,
      })),
    });
  } catch (err) {
    console.error("getRevenueSummary:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * SUPER_ADMIN — manual subscription update (+ optional payment record)
 */
export const updateSubscriptionManual = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { plan, status, expiresAt, paymentId, amount, provider, transactionId, paymentStatus } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ message: "Invalid college id" });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    let sub = await ensureSubscriptionForCollege(college._id);

    if (plan !== undefined) {
      if (!["FREE", "PRO", "ENTERPRISE"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }
      sub.plan = plan;
    }
    if (status !== undefined) {
      if (!["ACTIVE", "EXPIRED", "TRIAL"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      sub.status = status;
    }
    if (expiresAt !== undefined) {
      sub.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    if (paymentId !== undefined) {
      sub.paymentId = paymentId || null;
    }

    await sub.save();

    if (amount != null && provider) {
      if (!["RAZORPAY", "STRIPE"].includes(provider)) {
        return res.status(400).json({ message: "Invalid provider" });
      }
      const payStatus = paymentStatus === "FAILED" ? "FAILED" : "COMPLETED";
      await Payment.create({
        college: college._id,
        amount: Number(amount),
        status: payStatus,
        provider,
        transactionId: transactionId || null,
      });
    }

    await logAudit({
      req,
      action: "UPDATE_SUBSCRIPTION",
      entity: "Subscription",
      entityId: sub._id,
      metadata: { collegeId: college._id.toString(), plan: sub.plan, status: sub.status },
    });

    const populated = await Subscription.findById(sub._id).lean();
    res.json({ subscription: populated, collegeId: college._id });
  } catch (err) {
    console.error("updateSubscriptionManual:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * COLLEGE_ADMIN — own college subscription + recent payments (tenant isolation)
 */
export const getMyCollegeSubscription = async (req, res) => {
  try {
    if (req.user.role !== "COLLEGE_ADMIN" || !req.user.college) {
      return res.status(403).json({ message: "Only college admins can view this" });
    }

    const collegeId = req.user.college;
    const college = await College.findById(collegeId).populate("subscription").lean();
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    let sub = college.subscription;
    if (!sub) {
      const created = await ensureSubscriptionForCollege(collegeId);
      sub = created ? (created.toObject ? created.toObject() : created) : null;
    } else if (sub && typeof sub.toObject === "function") {
      sub = sub.toObject();
    }

    const payments = await Payment.find({ college: collegeId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      college: {
        _id: college._id,
        name: college.name,
        code: college.code,
        isActive: college.isActive,
      },
      subscription: sub,
      recentPayments: payments,
    });
  } catch (err) {
    console.error("getMyCollegeSubscription:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
