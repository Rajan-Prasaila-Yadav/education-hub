// src/pages/student/StudentToday.jsx
import { useState, useEffect } from 'react'
import { studentApi } from '@/services/api'
import { Spinner, EmptyState, Icon } from '@/components/ui'

export default function StudentToday() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentApi.today().then(setClasses).finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const getStatus = (start, end) => {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const s = sh * 60 + sm, e = eh * 60 + em
    if (currentMinutes < s) return 'upcoming'
    if (currentMinutes >= s && currentMinutes <= e) return 'ongoing'
    return 'done'
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Today's schedule</h1>
          <p className="page-sub">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="card p-16">
          <EmptyState icon="calendar" title="No classes today" description="You're free today! Check tomorrow's schedule on your dashboard." />
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-4 bottom-4 w-px bg-ink-100" />

          <div className="space-y-3">
            {classes.map((c, i) => {
              const status = getStatus(c.startTime, c.endTime)
              return (
                <div key={c._id || i} className="relative flex items-start gap-5 pl-16">
                  {/* Dot */}
                  <div className={`absolute left-[26px] top-4 w-4 h-4 rounded-full border-2 z-10 transition-colors ${
                    status === 'ongoing'  ? 'bg-jade-500  border-jade-300 shadow-[0_0_8px_rgba(0,200,150,0.4)]' :
                    status === 'upcoming' ? 'bg-white      border-azure-400' :
                                           'bg-ink-200    border-ink-200'
                  }`} />

                  <div className={`card flex-1 p-4 transition-all duration-300 ${
                    status === 'ongoing'  ? 'border-jade-200 bg-jade-50/30' :
                    status === 'done'     ? 'opacity-50' : ''
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${status === 'done' ? 'text-ink-500' : 'text-ink-900'}`}>
                          {c.subject?.name}
                        </p>
                        <p className="text-xs text-ink-500 mt-0.5">{c.teacher?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono text-ink-600">{c.startTime}–{c.endTime}</p>
                        {status === 'ongoing' && (
                          <span className="mt-1 inline-block badge-green text-xs">Now</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
