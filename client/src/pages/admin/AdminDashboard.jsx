// client/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { adminApi } from '@/services/api'
import { StatCard, EmptyState, Spinner, ProgressRing, Icon } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.dashboardStats().then(setStats).finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  const s = stats || {}
  const passRate = s.academics?.results
    ? Math.round((s.academics.results.pass / ((s.academics.results.pass + s.academics.results.fail) || 1)) * 100)
    : 0

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="text-sm text-ink-500 mb-0.5">{greeting()},</p>
          <h1 className="page-title">{user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here's what's happening at your college today.</p>
        </div>
        <p className="text-xs text-ink-400 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPI grid — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Students"      value={s.users?.students}               icon="users"    color="blue"  sub="enrolled" />
        <StatCard label="Teachers"      value={s.users?.teachers}               icon="academic" color="green" sub="active" />
        <StatCard label="Exams"         value={s.academics?.totalExams}         icon="award"    color="amber" sub="total" />
        <StatCard label="Avg attendance"value={`${s.academics?.avgAttendance ?? 0}%`} icon="check" color={s.academics?.avgAttendance >= 75 ? 'green' : 'red'} />
      </div>

      {/* Charts row — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Attendance ring */}
        <div className="card p-5 flex flex-col items-center gap-4">
          <p className="heading-section text-sm text-ink-900 self-start">Attendance</p>
          <ProgressRing pct={s.academics?.avgAttendance ?? 0} size={100} stroke={7} />
          <p className="text-xs text-ink-500 text-center">
            {(s.academics?.avgAttendance ?? 0) >= 75 ? '✅ Above threshold' : '⚠️ Below 75%'}
          </p>
        </div>

        {/* Pass/fail */}
        <div className="card p-5 col-span-1 lg:col-span-2">
          <p className="heading-section text-sm text-ink-900 mb-4">Exam results</p>
          {s.academics?.results ? (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-ink-600">Pass</span>
                  <span className="font-semibold text-jade-500">{s.academics.results.pass}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-jade-500" style={{ width: `${passRate}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-ink-600">Fail</span>
                  <span className="font-semibold text-coral-500">{s.academics.results.fail}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-coral-500" style={{ width: `${100 - passRate}%` }} />
                </div>
              </div>
              <p className="text-xs text-ink-500 pt-1">Overall pass rate: <strong className="text-ink-900">{passRate}%</strong></p>
            </div>
          ) : (
            <EmptyState icon="chart" title="No exam data yet" />
          )}
        </div>
      </div>

      {/* Quick actions — 2 cols mobile, 4 cols desktop */}
      <div className="card p-5">
        <p className="heading-section text-sm text-ink-900 mb-4">Quick actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add student',  href: '/admin/students',      icon: 'users',    color: 'bg-azure-50 text-azure-600' },
            { label: 'Add teacher',  href: '/admin/teachers',      icon: 'academic', color: 'bg-jade-50 text-jade-600' },
            { label: 'Create exam',  href: '/admin/exams',         icon: 'award',    color: 'bg-amber-50 text-amber-600' },
            { label: 'Send notice',  href: '/admin/notifications', icon: 'bell',     color: 'bg-coral-50 text-coral-600' },
          ].map(a => (
            <Link key={a.label} to={a.href}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-ink-50 hover:bg-ink-100 transition-all duration-200 cursor-pointer group">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform duration-200`}>
                <Icon name={a.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-semibold text-ink-600 text-center leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
