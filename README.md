# EduXo — College Management Platform

Full-stack monorepo:  
**server/** → Node.js + Express + MongoDB  
**client/** → React 18 + Vite + Tailwind CSS

---

## Folder structure

```
eduxo/
├── package.json          ← root (runs both with concurrently)
├── .gitignore
├── server/
│   ├── package.json
│   ├── .env.example      ← copy to .env and fill in values
│   ├── uploads/          ← PDF notes saved here (auto-created)
│   └── src/
│       ├── server.js     ← entry point
│       ├── app.js        ← Express app, routes, CORS
│       ├── config/
│       │   ├── db.js
│       │   └── multer.js
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── application/  ← service layer (exams, notifications)
│       ├── shared/errors/
│       └── utils/
│           └── seed.js   ← creates test users on first run
└── client/
    ├── package.json
    ├── .env.development  ← already configured for localhost
    ├── .env.production   ← change VITE_API_BASE_URL before build
    ├── vite.config.js
    └── src/
        ├── services/api.js   ← all API calls
        ├── contexts/AuthContext.jsx
        ├── components/
        └── pages/
```

---

## 1. Prerequisites

- **Node.js** 18 or later
- **MongoDB** running locally OR a free MongoDB Atlas cluster
- **npm** 9+

---

## 2. First-time setup

### Step 1 — Install dependencies

```bash
# From the project root (eduxo/)
npm run install:all
```

This installs packages in root, server/, and client/.

### Step 2 — Configure the backend

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/eduxo
JWT_SECRET=paste_a_64_char_random_string_here
CORS_ORIGINS=http://localhost:5173
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3 — Seed the database

```bash
cd server
npm run seed
```

This creates four ready-to-use accounts:

| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | super@eduxo.com | admin123 |
| COLLEGE_ADMIN | admin@democollege.com | admin123 |
| TEACHER | teacher@democollege.com | teacher123 |
| STUDENT | student@democollege.com | student123 |

---

## 3. Run in development

### Option A — both at once (recommended)

```bash
# From eduxo/ root
npm run dev
```

This runs server (port 3000) and client (port 5173) together.

### Option B — separate terminals

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open **http://localhost:5173** — the login page appears.

---

## 4. API endpoint reference

All endpoints are prefixed `/api`.  
Protected routes require `Authorization: Bearer <token>` header.

### Auth — `/api/auth`
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/login` | No | `{email, password}` |
| POST | `/change-password` | Yes | `{currentPassword, newPassword}` |
| POST | `/forgot-password` | No | `{email}` |
| POST | `/reset-password` | No | `{token, newPassword}` |

### Admin — `/api/admin` (COLLEGE_ADMIN)
| Method | Path | Body / Params |
|--------|------|---------------|
| GET | `/dashboard-stats` | — |
| POST | `/college` | `{name, address}` (SUPER_ADMIN only) |
| GET | `/colleges` | — (SUPER_ADMIN only) |
| POST | `/department` | `{name}` |
| GET | `/departments` | — |
| POST | `/semester` | `{name, department}` |
| GET | `/semesters` | — |
| POST | `/subject` | `{name, semester}` |
| GET | `/subjects` | — |
| POST | `/assign-student-semester` | `{studentId, semesterId}` |
| GET | `/semester-report/:semesterId` | — |

### Users — `/api/users`
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/` | COLLEGE_ADMIN / SUPER_ADMIN | Query: `?role=STUDENT&search=name` |
| POST | `/create` | COLLEGE_ADMIN / SUPER_ADMIN | `{name, email, role, college}` |

### Attendance — `/api/attendance`
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/mark` | TEACHER | `{subjectId, semesterId, date, records:[{student, status}]}` |
| GET | `/my` | STUDENT | — |
| GET | `/stats` | STUDENT | — |

### Exams — `/api/exams`
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/create` | TEACHER | `{title, subjectId, semesterId, maxMarks, passMarks?}` |
| POST | `/marks` | TEACHER | `{examId, studentId, marks}` |
| POST | `/upload-marks` | TEACHER | `{examId, marks:[{studentId, marksObtained}]}` |
| GET | `/my-results` | STUDENT | — |
| GET | `/mine` | TEACHER | — |
| GET | `/:examId/results` | TEACHER | — |

### Timetable — `/api/timetable`
| Method | Path | Auth | Body |
|--------|------|------|------|
| GET | `/` | COLLEGE_ADMIN | Query: `?semester=id` |
| POST | `/create` | COLLEGE_ADMIN | `{subject, semester, teacher, day, startTime, endTime}` |
| GET | `/teacher/today` | TEACHER | — |
| GET | `/student/today` | STUDENT | — |

### Notes — `/api/notes`
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/upload` | TEACHER | multipart: `{title, subjectId, semesterId, file}` |
| GET | `/` | STUDENT | — |

### Notifications — `/api/notifications`
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/create` | COLLEGE_ADMIN | `{title, message, type?, roles?, semesterId?}` |
| GET | `/my` | STUDENT / TEACHER | — |
| PATCH | `/read/:id` | STUDENT / TEACHER | — |

### Teacher — `/api/teacher`
| Method | Path | Auth | Body |
|--------|------|------|------|
| GET | `/dashboard` | TEACHER | — |
| GET | `/today` | TEACHER | — |
| POST | `/assign-subject` | COLLEGE_ADMIN | `{subjectId, teacherId}` |
| GET | `/subject-report/:subjectId` | TEACHER | — |

### Student — `/api/student`
| Method | Path | Auth |
|--------|------|------|
| GET | `/dashboard` | STUDENT |
| GET | `/attendance` | STUDENT |
| GET | `/notes` | STUDENT |
| GET | `/today` | STUDENT |
| GET | `/attendance/analytics` | STUDENT |

### Audit — `/api/audit`
| Method | Path | Auth |
|--------|------|------|
| GET | `/` | SUPER_ADMIN |

---

## 5. Typical admin workflow after first login

1. Log in as **COLLEGE_ADMIN** (admin@democollege.com)
2. **Departments** → create at least one (e.g. "Computer Science")
3. **Semesters** → create semesters under that department
4. **Subjects** → create subjects under semesters
5. **Teachers** → add teacher accounts
6. **Subjects** → assign each subject to a teacher
7. **Students** → add student accounts
8. **Students** → assign each student to a semester
9. **Timetable** → create class slots (subject + teacher + semester + day + time)
10. Log in as **TEACHER** → mark attendance, create exams, upload notes
11. Log in as **STUDENT** → view dashboard, attendance, results, notes

---

## 6. Production deployment checklist

- [ ] `NODE_ENV=production` in server `.env`
- [ ] Strong random `JWT_SECRET` (64+ chars)
- [ ] `MONGO_URI` points to Atlas or production MongoDB
- [ ] `CORS_ORIGINS=https://yourdomain.com` (your real frontend URL)
- [ ] Build frontend: `cd client && npm run build` (after setting `VITE_API_BASE_URL` in `.env.production`)
- [ ] Serve `client/dist/` as static files via Nginx
- [ ] Proxy `/api/*` requests to Express via Nginx
- [ ] Use PM2 to keep Express running: `pm2 start src/server.js --name eduxo-api`
- [ ] `pm2 save && pm2 startup`
- [ ] SSL certificates via Let's Encrypt (certbot)

---

## 7. Common errors

| Error | Cause | Fix |
|---|---|---|
| `MongooseError: Connect ECONNREFUSED` | MongoDB not running | `sudo systemctl start mongod` or use Atlas |
| `JWT_SECRET is not defined` | .env not loaded | Check `.env` exists in `server/` folder |
| `CORS blocked` in browser | Frontend domain not in `CORS_ORIGINS` | Add it to `server/.env` and restart |
| `401 Unauthorized` on all requests | Wrong token or token expired | Clear localStorage, log in again |
| `403 Cross-college access denied` | User's college doesn't match resource | Admin must be same college as the resource |
| PDF upload 400 error | File is not a PDF | multer only accepts `application/pdf` |
