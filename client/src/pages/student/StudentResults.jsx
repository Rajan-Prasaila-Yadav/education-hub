// client/src/pages/student/StudentResults.jsx
import { useState, useEffect } from 'react'
import { examsApi } from '@/services/api'
import { Spinner, EmptyState, StatusBadge } from '@/components/ui'

export default function StudentResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    examsApi.myResults().then(setResults).finally(() => setLoading(false))
  }, [])

  const passCount = results.filter(r => r.status === 'PASS').length
  const avgPct    = results.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam results</h1>
          <p className="page-sub">Your performance across all exams</p>
        </div>
      </div>

      {/* Summary — 3 cols on all sizes but smaller on mobile */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
          {[
            { label: 'Exams taken',  value: results.length,   textColor: 'text-azure-600'  },
            { label: 'Passed',       value: passCount,         textColor: 'text-jade-600'   },
            { label: 'Average',      value: `${avgPct}%`,      textColor: 'text-amber-600'  },
          ].map(s => (
            <div key={s.label} className="card p-3 sm:p-4 text-center">
              <p className={`text-xl sm:text-2xl font-display font-bold ${s.textColor}`}>{s.value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="card p-12 sm:p-16">
          <EmptyState icon="award" title="No results yet" description="Your results will appear here once teachers publish them." />
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={i} className="card p-4 sm:p-5 flex items-center gap-3 sm:gap-5">
              {/* Percentage circle */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center flex-shrink-0
                ${r.status === 'PASS' ? 'bg-jade-50' : 'bg-coral-50'}`}>
                <span className={`text-base sm:text-lg font-display font-bold
                  ${r.status === 'PASS' ? 'text-jade-600' : 'text-coral-600'}`}>
                  {r.percentage}
                </span>
                <span className={`text-xs ${r.status === 'PASS' ? 'text-jade-400' : 'text-coral-400'}`}>%</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{r.exam}</p>
                <p className="text-xs text-ink-500 mt-0.5 truncate">{r.subject}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-base sm:text-lg font-display font-bold text-ink-900">
                  {r.marksObtained}
                  <span className="text-xs sm:text-sm font-normal text-ink-400">/{r.maxMarks}</span>
                </p>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
