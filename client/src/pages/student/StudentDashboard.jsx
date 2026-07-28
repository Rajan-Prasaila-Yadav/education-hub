// client/src/pages/student/StudentDashboard.jsx
import { useState, useEffect } from 'react'
import { studentApi } from '@/services/api'
import { StatCard, Icon, Spinner, EmptyState } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentApi.dashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const day   = new Date().toLocaleString('en-US', { weekday: 'long' }).toUpperCase()
  const today = data?.timetable?.filter(t => t.day === day) || []

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <p className="text-sm text-ink-500 mb-0.5">Hello,</p>
          <h1 className="page-title">{user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">
            {data?.semester?.name ? `Enrolled in ${data.semester.name}` : 'Not yet assigned to a semester'}
          </p>
        </div>
        <p className="text-xs text-ink-400 self-start mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats — 2 cols mobile, 3 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard label="Subjects"      value={data?.subjects?.length ?? 0} icon="book"     color="blue" />
        <StatCard label="Classes today" value={today.length}                icon="clock"    color="green" />
        <div className="col-span-2 lg:col-span-1">
          <StatCard label="Semester"    value={data?.semester?.name ?? '—'} icon="academic" color="amber" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's schedule */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-ink-100 flex items-center justify-between">
            <p className="heading-section text-sm text-ink-900">Today's schedule</p>
            <span className="badge-blue text-xs">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
            </span>
          </div>
          {today.length > 0 ? (
            <div className="divide-y divide-ink-50">
              {today.map((c, i) => (
                <div key={c._id || i} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5">
                  <div className="w-11 sm:w-12 h-11 sm:h-12 bg-azure-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-azure-700 font-mono leading-tight">{c.startTime}</span>
                    <div className="w-4 h-px bg-azure-200 my-0.5" />
                    <span className="text-xs text-azure-400 font-mono">{c.endTime}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{c.subject?.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5 truncate">{c.teacher?.name}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-jade-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10">
              <EmptyState icon="calendar" title="No classes today" description="Enjoy your free day!" />
            </div>
          )}
        </div>

        {/* Subjects */}
        <div className="card p-4 sm:p-5">
          <p className="heading-section text-sm text-ink-900 mb-3">My subjects</p>
          {data?.subjects?.length > 0 ? (
            <div className="space-y-2">
              {data.subjects.map(s => (
                <div key={s._id}
                  className="flex items-center gap-3 p-2.5 sm:p-3 bg-ink-50 rounded-xl hover:bg-ink-100 transition-colors">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-azure-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="book" className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-azure-600" />
                  </div>
                  <span className="text-sm font-medium text-ink-800 truncate">{s.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="book" title="No subjects" description="Assigned after semester enrolment" />
          )}
        </div>
      </div>
    </div>
  )
}
