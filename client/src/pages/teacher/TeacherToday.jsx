// client/src/pages/teacher/TeacherToday.jsx
import { useState, useEffect } from 'react'
import { teacherApi, attendanceApi } from '@/services/api'
import { Spinner, EmptyState, Icon } from '@/components/ui'
import { Link, useNavigate } from 'react-router-dom'

export default function TeacherToday() {
  const [classes,     setClasses]     = useState([])
  const [todayStatus, setTodayStatus] = useState([])
  const [loading,     setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      teacherApi.today(),
      attendanceApi.todayStatus(),
    ])
      .then(([cls, status]) => {
        setClasses(Array.isArray(cls)    ? cls    : [])
        setTodayStatus(Array.isArray(status) ? status : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const getStatus = (subjectId, semesterId) =>
    todayStatus.find(s => s.subjectId === subjectId && s.semesterId === semesterId) || null

  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const isOngoing = (start, end) => {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em
  }
  const isPast = (end) => {
    const [eh, em] = end.split(':').map(Number)
    return nowMins > eh * 60 + em
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Today's classes</h1>
          <p className="page-sub">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span className="w-2 h-2 bg-jade-400 rounded-full inline-block" /> Marked
          <span className="w-2 h-2 bg-amber-400 rounded-full inline-block ml-2" /> Ongoing
          <span className="w-2 h-2 bg-ink-300 rounded-full inline-block ml-2" /> Upcoming
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="card p-16">
          <EmptyState icon="calendar" title="No classes today" description="Nothing scheduled. Enjoy your day!" />
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((c) => {
            const marked   = getStatus(c.subject?._id, c.semester?._id)
            const ongoing  = isOngoing(c.startTime, c.endTime)
            const past     = isPast(c.endTime)

            return (
              <div key={c._id}
                className={`card p-5 flex items-center gap-4 transition-all border-2 ${
                  marked
                    ? 'border-jade-200 bg-jade-50/30'
                    : ongoing
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-transparent'
                }`}
              >
                {/* Time block */}
                <div className={`w-14 flex-shrink-0 rounded-xl flex flex-col items-center justify-center py-2.5 ${
                  marked ? 'bg-jade-100' : ongoing ? 'bg-amber-50' : 'bg-ink-50'
                }`}>
                  <span className={`text-xs font-bold font-mono ${
                    marked ? 'text-jade-700' : ongoing ? 'text-amber-700' : 'text-ink-600'
                  }`}>{c.startTime}</span>
                  <div className={`w-5 h-px my-0.5 ${
                    marked ? 'bg-jade-300' : ongoing ? 'bg-amber-200' : 'bg-ink-200'
                  }`} />
                  <span className={`text-xs font-mono ${
                    marked ? 'text-jade-500' : ongoing ? 'text-amber-500' : 'text-ink-400'
                  }`}>{c.endTime}</span>
                </div>

                {/* Subject info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink-900 text-sm">{c.subject?.name}</p>
                    {ongoing && !marked && (
                      <span className="badge-amber text-xs">Live now</span>
                    )}
                    {marked && (
                      <span className="badge-green text-xs">
                        ✓ {marked.presentCount}/{marked.totalCount} present
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">{c.semester?.name}</p>
                </div>

                {/* Action */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {marked ? (
                    // Already marked — show edit button only
                    <button
                      onClick={() => navigate('/teacher/attendance')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-jade-100 text-jade-700 hover:bg-jade-200 border border-jade-200 transition-colors"
                    >
                      <Icon name="pencil" className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  ) : (
                    // Not marked yet — show mark attendance
                    <Link
                      to="/teacher/attendance"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        past
                          ? 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                          : 'bg-ink-900 text-white hover:bg-ink-700'
                      }`}
                    >
                      <Icon name="check" className="w-3.5 h-3.5" />
                      {past ? 'Mark (late)' : 'Mark attendance'}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {classes.length > 0 && (
        <div className="mt-4 card p-4 flex items-center gap-6 text-sm flex-wrap">
          <span className="text-ink-500">
            Total: <strong className="text-ink-900">{classes.length}</strong>
          </span>
          <span className="text-jade-600">
            Marked: <strong>{todayStatus.length}</strong>
          </span>
          <span className="text-amber-600">
            Pending: <strong>{classes.length - todayStatus.length}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
