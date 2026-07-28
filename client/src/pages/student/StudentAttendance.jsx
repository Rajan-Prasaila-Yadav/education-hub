// src/pages/student/StudentAttendance.jsx
import { useState, useEffect } from 'react'
import { studentApi } from '@/services/api'
import { Spinner, EmptyState, ProgressRing, Icon } from '@/components/ui'

export default function StudentAttendance() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentApi.attendanceAnalytics().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const overall = data?.overall || {}
  const subjects = data?.subjects || []

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-sub">Your attendance record across all subjects</p>
        </div>
      </div>

      {/* Overall card */}
      <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <ProgressRing pct={overall.percentage ?? 0} size={112} stroke={8} />
        <div className="flex-1">
          <p className="heading-section text-xl text-ink-900 mb-1">
            {overall.percentage >= 75 ? '✅ Eligible to sit exams' : '⚠️ Below required threshold'}
          </p>
          <p className="text-sm text-ink-500 mb-4">Minimum 75% attendance required</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total classes', value: overall.totalClasses, color: 'text-ink-900' },
              { label: 'Present',       value: overall.present,      color: 'text-jade-600' },
              { label: 'Absent',        value: overall.absent,       color: 'text-coral-600' },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value ?? 0}</p>
                <p className="text-xs text-ink-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject-wise */}
      <h2 className="heading-section text-base text-ink-900 mb-3">Subject breakdown</h2>
      {subjects.length === 0 ? (
        <div className="card p-12">
          <EmptyState icon="chart" title="No attendance data" description="Attendance will appear after your first class" />
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.sort((a, b) => a.percentage - b.percentage).map(s => (
            <div key={s.subject} className="card p-4 flex items-center gap-4">
              <div className="flex-shrink-0">
                <ProgressRing pct={s.percentage} size={52} stroke={4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{s.subject}</p>
                <p className="text-xs text-ink-500 mt-0.5">{s.present}/{s.total} classes attended</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className={`badge ${s.percentage >= 75 ? 'badge-green' : s.percentage >= 50 ? 'badge-amber' : 'badge-red'}`}>
                  {s.percentage >= 75 ? 'Safe' : s.percentage >= 50 ? 'At risk' : 'Critical'}
                </span>
                {s.percentage < 75 && (
                  <p className="text-xs text-ink-400 mt-1">
                    Need {Math.max(0, Math.ceil((0.75 * s.total - s.present) / 0.25))} more
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
