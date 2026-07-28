import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Notify all students of a semester
export const notifyStudentsOfSemester = async ({
  semesterId,
  title,
  message,
  type = "GENERAL",
}) => {
  const students = await User.find({ semester: semesterId, role: "STUDENT" });

  const notifications = students.map((s) => ({
    user: s._id,
    title,
    message,
    type,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
};

// Notify single student
export const notifyStudent = async ({ studentId, title, message, type }) => {
  await Notification.create({
    user: studentId,
    title,
    message,
    type,
  });
};