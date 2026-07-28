// client/src/components/layout/AppShell.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Icon, Avatar } from '@/components/ui'

const NAV = {
  COLLEGE_ADMIN: [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'Students', href: '/admin/students', icon: 'users' },
    { label: 'Teachers', href: '/admin/teachers', icon: 'academic' },
    { label: 'Departments', href: '/admin/departments', icon: 'building' },
    { label: 'Semesters', href: '/admin/semesters', icon: 'calendar' },
    { label: 'Subjects', href: '/admin/subjects', icon: 'book' },
    { label: 'Timetable', href: '/admin/timetable', icon: 'clock' },
    { label: 'Attendance', href: '/admin/attendance', icon: 'check' },
    { label: 'Exams', href: '/admin/exams', icon: 'award' },
    { label: 'Notifications', href: '/admin/notifications', icon: 'bell' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'chart' },
    { label: 'Billing', href: '/admin/billing', icon: 'award' },
  ],
  SUPER_ADMIN: [
    { label: 'Colleges', href: '/super/colleges', icon: 'building' },
    { label: 'Colleges & billing', href: '/super/billing', icon: 'chart' },
    { label: 'Admins', href: '/super/admins', icon: 'users' },
    { label: 'Audit Log', href: '/super/audit', icon: 'document' },
  ],
  TEACHER: [
    { label: 'Dashboard', href: '/teacher', icon: 'dashboard' },
    { label: "Today's Classes", href: '/teacher/today', icon: 'clock' },
    { label: 'Attendance', href: '/teacher/attendance', icon: 'check' },
    { label: 'Exams', href: '/teacher/exams', icon: 'award' },
    { label: 'Upload Notes', href: '/teacher/notes', icon: 'upload' },
    { label: 'Notifications', href: '/teacher/notifications', icon: 'bell' },
  ],
  STUDENT: [
    { label: 'Dashboard', href: '/student', icon: 'dashboard' },
    { label: "Today's Schedule", href: '/student/today', icon: 'clock' },
    { label: 'Attendance', href: '/student/attendance', icon: 'chart' },
    { label: 'Exam Results', href: '/student/results', icon: 'award' },
    { label: 'Notes', href: '/student/notes', icon: 'book' },
    { label: 'Notifications', href: '/student/notifications', icon: 'bell' },
  ],
}

// Bottom nav shows only the 4-5 most important items per role
const BOTTOM_NAV = {
  COLLEGE_ADMIN: [
    { label: 'Home', href: '/admin', icon: 'dashboard' },
    { label: 'Students', href: '/admin/students', icon: 'users' },
    { label: 'Timetable', href: '/admin/timetable', icon: 'clock' },
    { label: 'Notify', href: '/admin/notifications', icon: 'bell' },
    { label: 'More', href: null, icon: 'menu', isMore: true },
  ],
  SUPER_ADMIN: [
    { label: 'Colleges', href: '/super/colleges', icon: 'building' },
    { label: 'Billing', href: '/super/billing', icon: 'chart' },
    { label: 'Admins', href: '/super/admins', icon: 'users' },
    { label: 'Audit', href: '/super/audit', icon: 'document' },
  ],
  TEACHER: [
    { label: 'Home', href: '/teacher', icon: 'dashboard' },
    { label: 'Today', href: '/teacher/today', icon: 'clock' },
    { label: 'Attendance', href: '/teacher/attendance', icon: 'check' },
    { label: 'Exams', href: '/teacher/exams', icon: 'award' },
    { label: 'More', href: null, icon: 'menu', isMore: true },
  ],
  STUDENT: [
    { label: 'Home', href: '/student', icon: 'dashboard' },
    { label: 'Today', href: '/student/today', icon: 'clock' },
    { label: 'Attendance', href: '/student/attendance', icon: 'chart' },
    { label: 'Results', href: '/student/results', icon: 'award' },
    { label: 'Notes', href: '/student/notes', icon: 'book' },
  ],
}

const ROLE_COLOR = {
  SUPER_ADMIN: 'volt',
  COLLEGE_ADMIN: 'amber',
  TEACHER: 'blue',
  STUDENT: 'green',
}

function isActive(href, pathname) {
  if (!href) return false
  if (href === '/admin' || href === '/teacher' || href === '/student' || href === '/super/colleges')
    return pathname === href
  return pathname.startsWith(href)
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = NAV[user?.role] || []
  const bottomItems = BOTTOM_NAV[user?.role] || []
  const roleColor = ROLE_COLOR[user?.role] || 'blue'

  const handleLogout = () => { logout(); navigate('/login') }
  const currentLabel = navItems.find(n => isActive(n.href, location.pathname))?.label || 'EduXo'

  const SidebarContent = ({ onNavigate }) => (
    <aside className="bg-white border-r border-ink-100 flex flex-col h-full w-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-ink-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
            <span className="text-volt-500 font-display font-bold text-sm">E</span>
          </div>
          <span className="heading-section text-lg text-ink-900">EduXo</span>
        </div>
        {/* Close button — mobile only */}
        {onNavigate && (
          <button onClick={onNavigate} className="lg:hidden btn-icon">
            <Icon name="x" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User card */}
      <div className="mx-4 my-4 p-3 bg-ink-50 rounded-2xl flex items-center gap-3">
        <Avatar name={user?.name || 'U'} size="sm" color={roleColor} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900 truncate">{user?.name}</p>
          <p className="text-xs text-ink-400">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        {navItems.map(item => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={`nav-item ${isActive(item.href, location.pathname) ? 'active' : ''}`}
          >
            <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-ink-100 space-y-0.5">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-left text-coral-500 hover:bg-coral-50 hover:text-coral-600"
        >
          <Icon name="logout" className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <div className="sidebar hidden lg:flex flex-col">
        <SidebarContent />
      </div>

      {/* Top bar */}
      <header className="topbar bg-white border-b border-ink-100 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden btn-icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>
          {/* Logo on mobile (sidebar hidden) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-ink-900 rounded-lg flex items-center justify-center">
              <span className="text-volt-500 font-display font-bold text-xs">E</span>
            </div>
          </div>
          <h1 className="heading-section text-sm sm:text-base text-ink-900 truncate max-w-[140px] sm:max-w-none">
            {currentLabel}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to={`/${(user?.role === 'COLLEGE_ADMIN' ? 'admin' : user?.role?.toLowerCase().replace('_admin', '') || '')}/${user?.role === 'COLLEGE_ADMIN' ? 'notifications' : user?.role === 'SUPER_ADMIN' ? '' : 'notifications'}`}
            className="relative btn-icon"
          >
            <Icon name="bell" className="w-5 h-5" />
            <span className="notif-dot" />
          </Link>
          <Avatar name={user?.name || 'U'} size="sm" color={roleColor} />
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" />
          <div
            className="absolute inset-y-0 left-0 w-[280px] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Bottom navigation bar (mobile only) ── */}
      <nav className="bottom-nav">
        {bottomItems.map((item, i) =>
          item.isMore ? (
            <button
              key={i}
              onClick={() => setMobileOpen(true)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-0 flex-1
                text-ink-400 hover:text-ink-700 transition-colors`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-0 flex-1 transition-colors
                ${isActive(item.href, location.pathname)
                  ? 'text-ink-900'
                  : 'text-ink-400 hover:text-ink-700'
                }`}
            >
              <div className={`relative p-1 rounded-lg transition-colors ${isActive(item.href, location.pathname) ? 'bg-ink-100' : ''
                }`}>
                <Icon name={item.icon} className="w-5 h-5" />
                {item.icon === 'bell' && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-coral-500 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium truncate ${isActive(item.href, location.pathname) ? 'font-semibold text-ink-900' : ''
                }`}>{item.label}</span>
            </Link>
          )
        )}
      </nav>
    </div>
  )
}
