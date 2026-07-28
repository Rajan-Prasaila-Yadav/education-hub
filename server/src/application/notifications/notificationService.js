import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import { HttpError } from "../../shared/errors/HttpError.js";

export async function createNotifications({
  actor,
  payload,
}) {
  const {
    user,
    userIds,
    roles,
    semesterId,
    title,
    message,
    type = "GENERAL",
  } = payload;

  if (!title || !message) {
    throw new HttpError(400, "title and message are required");
  }

  // 1) single-recipient mode
  if (user) {
    const notification = await Notification.create({ user, title, message, type });
    return { mode: "single", count: 1, notification };
  }

  // 2) explicit list mode
  if (Array.isArray(userIds) && userIds.length > 0) {
    const docs = userIds.map((u) => ({ user: u, title, message, type }));
    await Notification.insertMany(docs);
    return { mode: "list", count: docs.length };
  }

  // 3) targeting mode (college admin scoped to own college)
  if (!actor?.college) {
    throw new HttpError(400, "College context missing");
  }

  const baseQuery = { college: actor.college };
  let recipientQuery = { ...baseQuery };

  if (semesterId) {
    recipientQuery = { ...recipientQuery, role: "STUDENT", semester: semesterId };
  } else if (Array.isArray(roles) && roles.length > 0) {
    recipientQuery = { ...recipientQuery, role: { $in: roles } };
  }

  const recipients = await User.find(recipientQuery).select("_id");
  const docs = recipients.map((r) => ({
    user: r._id,
    title,
    message,
    type,
  }));

  if (docs.length > 0) {
    await Notification.insertMany(docs);
  }

  return { mode: "targeted", count: docs.length };
}

export async function listMyNotifications({ userId }) {
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  return notifications.map((n) => ({
    id: n._id,
    title: n.title,
    message: n.message,
    type: n.type,
    createdAt: n.createdAt,
    isRead: n.isRead,
  }));
}

export async function markNotificationRead({ userId, notificationId }) {
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!updated) {
    throw new HttpError(404, "Notification not found");
  }
}

