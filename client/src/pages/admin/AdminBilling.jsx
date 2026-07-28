// client/src/pages/admin/AdminBilling.jsx
// COLLEGE_ADMIN only — view own college's subscription and payment history.
import { useState, useEffect } from 'react'
import { subscriptionApi } from '@/services/api'
import { Spinner, EmptyState, Icon, ProgressRing } from '@/components/ui'
import { Link } from 'react-router-dom'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtCurrency(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n ?? 0)
}

const PLAN_INFO = {
  FREE: {
    color: 'bg-ink-100 text-ink-700',
    icon: '🆓',
    desc: 'Basic features — limited analytics and bulk operations.',
    limits: [
      { label: 'Admin dashboard stats',        blocked: true  },
      { label: 'Semester attendance report',   blocked: true  },
      { label: 'Student attendance analytics', blocked: true  },
      { label: 'Bulk marks upload',            blocked: true  },
      { label: 'Attendance, exams, notes',     blocked: false },
      { label: 'Notifications',                blocked: false },
      { label: 'Timetable management',         blocked: false },
    ],
  },
  PRO: {
    color: 'bg-azure-50 text-azure-700',
    icon: '⭐',
    desc: 'Full feature access including analytics and bulk operations.',
    limits: [],
  },
  ENTERPRISE: {
    color: 'bg-amber-50 text-amber-700',
    icon: '🏢',
    desc: 'Enterprise plan — all features + priority support.',
    limits: [],
  },
}

const STATUS_INFO = {
  ACTIVE:  { badge: 'badge-green',  label: 'Active'  },
  TRIAL:   { badge: 'badge-amber',  label: 'Trial'   },
  EXPIRED: { badge: 'badge-red',    label: 'Expired' },
}

const PROVIDER_LOGO = {
  RAZORPAY: '₹',
  STRIPE:   '$',
}

export default function AdminBilling() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    subscriptionApi.collegeMe()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  if (error) return (
    <div className="card p-10 text-center">
      <p className="text-coral-600 font-medium">{error}</p>
    </div>
  )

  const { college, subscription: sub, recentPayments } = data || {}
  const plan   = sub?.plan   || 'FREE'
  const status = sub?.status || 'ACTIVE'
  const info   = PLAN_INFO[plan]  || PLAN_INFO.FREE
  const sinfo  = STATUS_INFO[status] || STATUS_INFO.ACTIVE

  // Days remaining
  let daysRemaining = null
  let daysPercent   = 100
  if (sub?.expiresAt) {
    const now  = Date.now()
    const exp  = new Date(sub.expiresAt).getTime()
    const diff = exp - now
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    // Show progress as fraction of 365 days
    daysPercent = Math.min(100, Math.round((daysRemaining / 365) * 100))
  }

  const isExpired = status === 'EXPIRED' || (sub?.expiresAt && new Date(sub.expiresAt) < new Date())

  return (
    <div className="animate-fade-up max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & subscription</h1>
          <p className="page-sub">{college?.name}</p>
        </div>
      </div>

      {/* Expired banner */}
      {isExpired && (
        <div className="mb-5 p-4 bg-coral-50 border border-coral-200 rounded-2xl flex items-start gap-3">
          <span className="text-xl mt-0.5">🔒</span>
          <div>
            <p className="text-sm font-semibold text-coral-800">Subscription expired</p>
            <p className="text-xs text-coral-600 mt-0.5">
              Some features are locked. Contact your EduXo administrator to renew.
            </p>
          </div>
        </div>
      )}

      {/* Plan card */}
      <div className="card p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${info.color}`}>
              {info.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg font-display font-bold text-ink-900`}>{plan} plan</span>
                <span className={`badge ${sinfo.badge}`}>{sinfo.label}</span>
              </div>
              <p className="text-sm text-ink-500">{info.desc}</p>
            </div>
          </div>

          {/* Days remaining ring */}
          {sub?.expiresAt && (
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <ProgressRing
                pct={daysPercent}
                size={72}
                stroke={5}
              />
              <p className="text-xs text-ink-500 text-center">
                {daysRemaining != null ? `${daysRemaining}d left` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Expiry */}
        <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Expires</p>
            <p className="font-medium text-ink-800">{fmtDate(sub?.expiresAt)}</p>
          </div>
          {sub?.paymentId && (
            <div>
              <p className="text-xs text-ink-400 mb-0.5">Last payment ref</p>
              <code className="text-xs bg-ink-50 border border-ink-200 px-1.5 py-0.5 rounded">
                {sub.paymentId}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Feature limits (FREE plan) */}
      {plan === 'FREE' && info.limits.length > 0 && (
        <div className="card p-5 mb-5">
          <p className="heading-section text-sm text-ink-900 mb-3">Feature access on FREE plan</p>
          <div className="space-y-2">
            {info.limits.map(l => (
              <div key={l.label} className="flex items-center gap-3 text-sm">
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  l.blocked ? 'bg-coral-100 text-coral-600' : 'bg-jade-100 text-jade-600'
                }`}>
                  {l.blocked ? '✕' : '✓'}
                </span>
                <span className={l.blocked ? 'text-ink-500 line-through' : 'text-ink-800'}>
                  {l.label}
                </span>
                {l.blocked && (
                  <span className="text-xs text-amber-600 font-medium">PRO+</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            Contact your EduXo administrator to upgrade to PRO and unlock all features.
          </div>
        </div>
      )}

      {/* Payment history */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100">
          <p className="heading-section text-sm text-ink-900">Payment history</p>
        </div>
        {!recentPayments?.length ? (
          <div className="py-10">
            <EmptyState icon="document" title="No payments recorded" description="Payment records will appear here." />
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
            {recentPayments.map(p => (
              <div key={p._id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  p.status === 'COMPLETED' ? 'bg-jade-50 text-jade-700' :
                  p.status === 'FAILED'    ? 'bg-coral-50 text-coral-700' :
                                             'bg-ink-50 text-ink-500'
                }`}>
                  {PROVIDER_LOGO[p.provider] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{fmtCurrency(p.amount)}</p>
                  <p className="text-xs text-ink-500">
                    {p.provider}
                    {p.transactionId && <span className="ml-2 font-mono">{p.transactionId}</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`badge ${
                    p.status === 'COMPLETED' ? 'badge-green' :
                    p.status === 'FAILED'    ? 'badge-red'   : 'badge-gray'
                  }`}>{p.status}</span>
                  <p className="text-xs text-ink-400 mt-1">{fmtDate(p.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
