// src/pages/teacher/TeacherDashboard.jsx
import { useState, useEffect } from 'react'
import { teacherApi } from '@/services/api'
import { StatCard, Icon, Spinner, EmptyState } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teacherApi.dashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <p className="text-sm text-ink-500 mb-1">Welcome back,</p>
          <h1 className="page-title">{user?.name} 👋</h1>
          <p className="page-sub">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="My subjects"       value={data?.subjects?.length ?? 0} icon="book"     color="blue" />
        <StatCard label="Classes today"     value={data?.todayClasses?.length ?? 0} icon="clock" color="green" />
      </div>

      {/* Subjects */}
      <div className="card p-6 mb-6">
        <p className="heading-section text-base text-ink-900 mb-4">My subjects</p>
        {data?.subjects?.length ? (
          <div className="flex flex-wrap gap-2">
            {data.subjects.map(s => (
              <span key={s._id} className="px-4 py-2 bg-azure-50 text-azure-700 rounded-xl text-sm font-medium border border-azure-100">
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState icon="book" title="No subjects assigned" description="Contact admin to get subjects assigned" />
        )}
      </div>

      {/* Today's classes */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
          <p className="heading-section text-base text-ink-900">Today's classes</p>
          <span className="badge-blue">{new Date().toLocaleDateString('en-IN', { weekday:'long' })}</span>
        </div>
        {data?.todayClasses?.length ? (
          <div className="divide-y divide-ink-50">
            {data.todayClasses.map(c => (
              <div key={c._id} className="flex items-center gap-4 px-6 py-4 hover:bg-ink-50/50 transition-colors">
                <div className="w-14 h-14 bg-azure-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-azure-600">{c.startTime}</span>
                  <div className="w-4 h-px bg-azure-200 my-0.5" />
                  <span className="text-xs text-azure-400">{c.endTime}</span>
                </div>
                <div>
                  <p className="font-semibold text-ink-900 text-sm">{c.subject?.name}</p>
                  <p className="text-xs text-ink-500">{c.semester?.name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8">
            <EmptyState icon="calendar" title="No classes today" description="Enjoy your free day!" />
          </div>
        )}
      </div>
    </div>
  )
}
