
import express from 'express'
import cors    from 'cors'
import path    from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimit.js";
import healthRoutes from "./routes/healthRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";


const app = express();

// ── CORS ────────────────────────────────────────────────────────────────
const allowedOrigins =
  process.env.CORS_ORIGINS
    ?.split(',').map(s => s.trim()).filter(Boolean) ??
  (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173'])

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)  // Postman / curl
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return cb(null, true)
    }
    return cb(null, true)
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// security headers (should run before routes)
app.use(helmet());

// global API rate limit
app.use("/api", apiLimiter);

// health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    env: process.env.NODE_ENV
  });
});
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/test", testRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notes", noteRoutes);
// Serve uploaded PDFs — path resolved relative to server root
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", healthRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.get("/", (req, res) => {
  res.send("EduXo Backend is running 🚀");
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler should be last
app.use(errorHandler);






export default app;
