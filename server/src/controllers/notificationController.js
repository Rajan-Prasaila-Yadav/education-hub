import {
  createNotifications,
  listMyNotifications,
  markNotificationRead,
} from "../application/notifications/notificationService.js";

// Admin creates announcement (stored as per-user notifications)
export const createNotification = async (req, res) => {
  try {
    const result = await createNotifications({
      actor: req.user,
      payload: req.body,
    });

    if (result.mode === "single") {
      return res.status(201).json(result.notification);
    }

    res.status(201).json({ message: "Notifications created", count: result.count });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
};

// Student/Teacher fetch notifications (per-user)
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await listMyNotifications({ userId: req.user.id });
    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await markNotificationRead({ userId: req.user.id, notificationId: id });

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
};
