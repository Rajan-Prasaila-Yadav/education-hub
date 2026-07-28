// client/src/pages/admin/AdminAnalytics.jsx
import { useState, useEffect } from 'react'
import { adminApi } from '@/services/api'
import { StatCard, Spinner, EmptyState, ProgressRing } from '@/components/ui'

export default function AdminAnalytics() {
  const [stats,      setStats]      = useState(null)
  const [semesters,  setSemesters]  = useState([])
  const [selSem,     setSelSem]     = useState('')
  const [report,     setReport]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [repLoading, setRepLoading] = useState(false)

  useEffect(() => {
    Promise.all([adminApi.dashboardStats(), adminApi.listSemesters()])
      .then(([s, sem]) => { setStats(s); setSemesters(Array.isArray(sem) ? sem : []) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selSem) { setReport(null); return }
    setRepLoading(true)
    adminApi.semesterReport(selSem).then(setReport).finally(() => setRepLoading(false))
  }, [selSem])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const s        = stats || {}
  const passRate = s.academics?.results
    ? Math.round((s.academics.results.pass / ((s.academics.results.pass + s.academics.results.fail) || 1)) * 100)
    : 0

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">College-wide academic performance</p>
        </div>
      </div>

      {/* KPIs — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Students"      value={s.users?.students}  icon="users"    color="blue" />
        <StatCard label="Teachers"      value={s.users?.teachers}  icon="academic" color="green" />
        <StatCard label="Exams"         value={s.academics?.totalExams} icon="award" color="amber" />
        <StatCard label="Avg attendance"value={`${s.academics?.avgAttendance ?? 0}%`} icon="check"
          color={s.academics?.avgAttendance >= 75 ? 'green' : 'red'} />
      </div>

      {/* Charts — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <p className="heading-section text-sm mb-4">Pass / fail ratio</p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
            <ProgressRing pct={passRate} size={88} stroke={6} />
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-600">Passed</span>
                  <span className="font-semibold text-jade-600">{s.academics?.results?.pass ?? 0}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill bg-jade-500" style={{ width: `${passRate}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-600">Failed</span>
                  <span className="font-semibold text-coral-600">{s.academics?.results?.fail ?? 0}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill bg-coral-500" style={{ width: `${100-passRate}%` }} /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <p className="heading-section text-sm mb-4">Attendance health</p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
            <ProgressRing pct={s.academics?.avgAttendance ?? 0} size={88} stroke={6} />
            <div>
              <p className="text-sm text-ink-600 mb-1">College average</p>
              <p className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
                {s.academics?.avgAttendance ?? 0}%
              </p>
              <p className={`text-xs mt-1 font-medium ${s.academics?.avgAttendance >= 75 ? 'text-jade-600' : 'text-coral-600'}`}>
                {s.academics?.avgAttendance >= 75 ? '✅ Above threshold' : '⚠️ Below 75%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Semester drill-down */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="heading-section text-sm">Semester attendance report</p>
          <select className="input w-full sm:w-52"
            value={selSem} onChange={e => setSelSem(e.target.value)}>
            <option value="">Select semester…</option>
            {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {!selSem ? (
          <EmptyState icon="chart" title="Select a semester" description="Choose above to see the detailed report" />
        ) : repLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : !report?.report?.length ? (
          <EmptyState icon="users" title="No attendance data" />
        ) : (
          /* Scrollable table on mobile */
          <div className="overflow-x-auto -mx-5">
            <table className="table" style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Classes</th>
                  <th>Present</th>
                  <th>Attendance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.report.sort((a, b) => b.percentage - a.percentage).map(r => (
                  <tr key={r.student?._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-ink-100 text-ink-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {r.student?.name?.split(' ').map(w => w[0]).slice(0,2).join('')}
                        </div>
                        <span className="font-medium truncate max-w-[100px] sm:max-w-none">{r.student?.name}</span>
                      </div>
                    </td>
                    <td>{r.totalClasses}</td>
                    <td>{r.present}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-16 sm:w-20 hidden sm:block">
                          <div className={`progress-fill ${r.percentage >= 75 ? 'bg-jade-500' : r.percentage >= 50 ? 'bg-amber-500' : 'bg-coral-500'}`}
                            style={{ width: `${r.percentage}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{r.percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${r.percentage >= 75 ? 'badge-green' : r.percentage >= 50 ? 'badge-amber' : 'badge-red'}`}>
                        {r.percentage >= 75 ? 'Eligible' : r.percentage >= 50 ? 'At risk' : 'Detained'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
