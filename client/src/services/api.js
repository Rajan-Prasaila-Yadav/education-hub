// client/src/services/api.js
//
// ── HOW THE BASE URL WORKS ──────────────────────────────────────────────────
// Development  (npm run dev):
//   BASE = '/api'  →  Vite proxy rewrites to http://localhost:3000/api
// Production  (npm run build):
//   BASE = 'https://api.yourdomain.com/api'  →  direct requests
//
const BASE = import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api'

const getToken = () => localStorage.getItem('eduxo_token')

// ── Subscription error emitter ───────────────────────────────────────────────
// Components can listen: window.addEventListener('eduxo:subscription_error', e => ...)
function emitSubscriptionEvent(code, message) {
  window.dispatchEvent(
    new CustomEvent('eduxo:subscription_error', { detail: { code, message } })
  )
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(method, path, body, isMultipart = false) {
  const headers = {}
  const token = getToken()
  if (token)        headers['Authorization']  = `Bearer ${token}`
  if (!isMultipart) headers['Content-Type']   = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  })

  // Auto-logout when token is expired / invalid
  if (res.status === 401) {
    localStorage.removeItem('eduxo_token')
    localStorage.removeItem('eduxo_user')
    window.location.href = '/login'
    return
  }

  const data = await res.json().catch(() => ({}))

  // ── Subscription errors: 402 expired, 403 plan limit ─────────────────────
  if (res.status === 402 && data.code === 'SUBSCRIPTION_EXPIRED') {
    emitSubscriptionEvent('SUBSCRIPTION_EXPIRED', data.message)
    throw Object.assign(new Error(data.message), { code: data.code, status: 402 })
  }
  if (res.status === 403 && data.code === 'PLAN_FREE_LIMIT') {
    emitSubscriptionEvent('PLAN_FREE_LIMIT', data.message)
    throw Object.assign(new Error(data.message), { code: data.code, status: 403 })
  }

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

const get    = (path)       => request('GET',    path)
const post   = (path, body) => request('POST',   path, body)
const patch  = (path, body) => request('PATCH',  path, body)
const upload = (path, form) => request('POST',   path, form, true)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (b) => post('/auth/login', b),
  changePassword: (b) => post('/auth/change-password', b),
  forgotPassword: (b) => post('/auth/forgot-password', b),
  resetPassword:  (b) => post('/auth/reset-password', b),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboardStats:        ()   => get('/admin/dashboard-stats'),
  createCollege:         (b)  => post('/admin/college', b),
  listColleges:          ()   => get('/admin/colleges'),
  createDepartment:      (b)  => post('/admin/department', b),
  listDepartments:       ()   => get('/admin/departments'),
  createSemester:        (b)  => post('/admin/semester', b),
  listSemesters:         ()   => get('/admin/semesters'),
  createSubject:         (b)  => post('/admin/subject', b),
  listSubjects:          ()   => get('/admin/subjects'),
  assignStudentSemester: (b)  => post('/admin/assign-student-semester', b),
  semesterReport:        (id) => get(`/admin/semester-report/${id}`),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list:   (q = '') => get(`/users?${q}`),
  create: (b)      => post('/users/create', b),
}

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  mark:        (b) => post('/attendance/mark', b),
  my:          ()  => get('/attendance/my'),
  stats:       ()  => get('/attendance/stats'),
  todayStatus: ()  => get('/attendance/today-status'),
}

// ── Exams ─────────────────────────────────────────────────────────────────────
export const examsApi = {
  create:      (b)  => post('/exams/create', b),
  enterMarks:  (b)  => post('/exams/marks', b),
  uploadMarks: (b)  => post('/exams/upload-marks', b),
  myResults:   ()   => get('/exams/my-results'),
  mine:        ()   => get('/exams/mine'),
  examResults: (id) => get(`/exams/${id}/results`),
}

// ── Timetable ─────────────────────────────────────────────────────────────────
export const timetableApi = {
  list:         (q = '') => get(`/timetable?${q}`),
  create:       (b)      => post('/timetable/create', b),
  teacherToday: ()       => get('/timetable/teacher/today'),
  studentToday: ()       => get('/timetable/student/today'),
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export const notesApi = {
  upload: (form) => upload('/notes/upload', form),
  list:   ()     => get('/notes'),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  create:   (b)  => post('/notifications/create', b),
  my:       ()   => get('/notifications/my'),
  markRead: (id) => patch(`/notifications/read/${id}`),
}

// ── Teacher ───────────────────────────────────────────────────────────────────
export const teacherApi = {
  dashboard:     ()   => get('/teacher/dashboard'),
  today:         ()   => get('/teacher/today'),
  subjectReport: (id) => get(`/teacher/subject-report/${id}`),
  assignSubject: (b)  => post('/teacher/assign-subject', b),
}

// ── Student ───────────────────────────────────────────────────────────────────
export const studentApi = {
  dashboard:           () => get('/student/dashboard'),
  attendance:          () => get('/student/attendance'),
  notes:               () => get('/student/notes'),
  today:               () => get('/student/today'),
  attendanceAnalytics: () => get('/student/attendance/analytics'),
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export const auditApi = {
  logs: () => get('/audit'),
}

// ── Subscription ──────────────────────────────────────────────────────────────
export const subscriptionApi = {
  // SUPER_ADMIN
  adminColleges:                  ()                   => get('/subscriptions/admin/colleges'),
  adminRevenue:                   ()                   => get('/subscriptions/admin/revenue'),
  adminUpdateCollegeSubscription: (collegeId, body)    => patch(`/subscriptions/admin/college/${collegeId}`, body),
  // COLLEGE_ADMIN
  collegeMe:                      ()                   => get('/subscriptions/college/me'),
}