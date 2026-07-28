// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ManageStudents from '@/pages/admin/ManageStudents'
import ManageTeachers from '@/pages/admin/ManageTeachers'
import AdminTimetable from '@/pages/admin/AdminTimetable'
import AdminNotifications from '@/pages/admin/AdminNotifications'
import AdminAnalytics from '@/pages/admin/AdminAnalytics'
import { DepartmentsPage, SemestersPage, SubjectsPage } from '@/pages/admin/AcademicSetup'

// Teacher
import TeacherDashboard from '@/pages/teacher/TeacherDashboard'
import TeacherToday from '@/pages/teacher/TeacherToday'
import TeacherAttendance from '@/pages/teacher/TeacherAttendance'
import TeacherExams from '@/pages/teacher/TeacherExams'
import UploadNotes from '@/pages/teacher/UploadNotes'

// Student
import StudentDashboard from '@/pages/student/StudentDashboard'
import StudentToday from '@/pages/student/StudentToday'
import StudentAttendance from '@/pages/student/StudentAttendance'
import StudentResults from '@/pages/student/StudentResults'
import StudentNotes from '@/pages/student/StudentNotes'

// Shared
import NotificationsPage from '@/pages/shared/NotificationsPage'
// subscription guard
import SubscriptionGuard from '@/pages/shared/SubscriptionGuard'

// Super Admin
import SuperColleges from '@/pages/super/SuperColleges'
import SuperCollegesBilling from '@/pages/super/SuperCollegesBilling'
import AdminsManagement from '@/pages/super/AdminsManagement'
import AuditLog from '@/pages/super/AuditLog'

import AdminBilling from '@/pages/admin/AdminBilling'
// ── Guards ──
function RequireAuth({ children, roles }) {
  const { user, isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />
  return children
}

function Shell({ roles, children }) {
  return (
    <RequireAuth roles={roles}>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <SubscriptionGuard />
      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Root redirect ── */}
        <Route path="/" element={
          user?.role === 'SUPER_ADMIN' ? <Navigate to="/super/colleges" replace /> :
            user?.role === 'COLLEGE_ADMIN' ? <Navigate to="/admin" replace /> :
              user?.role === 'TEACHER' ? <Navigate to="/teacher" replace /> :
                user?.role === 'STUDENT' ? <Navigate to="/student" replace /> :
                  <Navigate to="/login" replace />
        } />

        {/* SUPER_ADMIN — colleges and management */}
        <Route path="/super/colleges"
          element={<Shell roles={['SUPER_ADMIN']}><SuperColleges /></Shell>} />
        <Route path="/super/billing"
          element={<Shell roles={['SUPER_ADMIN']}><SuperCollegesBilling /></Shell>} />
        <Route path="/super/admins"
          element={<Shell roles={['SUPER_ADMIN']}><AdminsManagement /></Shell>} />
        <Route path="/super/audit"
          element={<Shell roles={['SUPER_ADMIN']}><AuditLog /></Shell>} />

        {/* COLLEGE_ADMIN — own billing */}
        <Route path="/admin/billing"
          element={<Shell roles={['COLLEGE_ADMIN']}><AdminBilling /></Shell>} />

        {/* ── COLLEGE ADMIN ── */}
        <Route path="/admin" element={<Shell roles={['COLLEGE_ADMIN']}><AdminDashboard /></Shell>} />
        <Route path="/admin/students" element={<Shell roles={['COLLEGE_ADMIN']}><ManageStudents /></Shell>} />
        <Route path="/admin/teachers" element={<Shell roles={['COLLEGE_ADMIN']}><ManageTeachers /></Shell>} />
        <Route path="/admin/departments" element={<Shell roles={['COLLEGE_ADMIN']}><DepartmentsPage /></Shell>} />
        <Route path="/admin/semesters" element={<Shell roles={['COLLEGE_ADMIN']}><SemestersPage /></Shell>} />
        <Route path="/admin/subjects" element={<Shell roles={['COLLEGE_ADMIN']}><SubjectsPage /></Shell>} />
        <Route path="/admin/timetable" element={<Shell roles={['COLLEGE_ADMIN']}><AdminTimetable /></Shell>} />
        <Route path="/admin/notifications" element={<Shell roles={['COLLEGE_ADMIN']}><AdminNotifications /></Shell>} />
        <Route path="/admin/analytics" element={<Shell roles={['COLLEGE_ADMIN']}><AdminAnalytics /></Shell>} />
        {/* /admin/attendance and /admin/exams can reuse analytics + existing pages */}
        <Route path="/admin/attendance" element={<Shell roles={['COLLEGE_ADMIN']}><AdminAnalytics /></Shell>} />
        <Route path="/admin/exams" element={<Shell roles={['COLLEGE_ADMIN']}><AdminAnalytics /></Shell>} />

        {/* ── TEACHER ── */}
        <Route path="/teacher" element={<Shell roles={['TEACHER']}><TeacherDashboard /></Shell>} />
        <Route path="/teacher/today" element={<Shell roles={['TEACHER']}><TeacherToday /></Shell>} />
        <Route path="/teacher/attendance" element={<Shell roles={['TEACHER']}><TeacherAttendance /></Shell>} />
        <Route path="/teacher/exams" element={<Shell roles={['TEACHER']}><TeacherExams /></Shell>} />
        <Route path="/teacher/notes" element={<Shell roles={['TEACHER']}><UploadNotes /></Shell>} />
        <Route path="/teacher/notifications" element={<Shell roles={['TEACHER']}><NotificationsPage /></Shell>} />

        {/* ── STUDENT ── */}
        <Route path="/student" element={<Shell roles={['STUDENT']}><StudentDashboard /></Shell>} />
        <Route path="/student/today" element={<Shell roles={['STUDENT']}><StudentToday /></Shell>} />
        <Route path="/student/attendance" element={<Shell roles={['STUDENT']}><StudentAttendance /></Shell>} />
        <Route path="/student/results" element={<Shell roles={['STUDENT']}><StudentResults /></Shell>} />
        <Route path="/student/notes" element={<Shell roles={['STUDENT']}><StudentNotes /></Shell>} />
        <Route path="/student/notifications" element={<Shell roles={['STUDENT']}><NotificationsPage /></Shell>} />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
