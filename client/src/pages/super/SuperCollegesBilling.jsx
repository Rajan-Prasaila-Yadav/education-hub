// client/src/pages/super/SuperCollegesBilling.jsx
// SUPER_ADMIN only — view all colleges with subscription status,
// revenue summary, and manually update any college's subscription.
import { useState, useEffect, useCallback } from 'react'
import { subscriptionApi } from '@/services/api'
import { StatCard, Modal, Icon, Spinner, EmptyState, useToast } from '@/components/ui'

// ── helpers ──────────────────────────────────────────────────────────────────
const PLAN_COLORS = {
  FREE:       'bg-ink-100  text-ink-600',
  PRO:        'bg-azure-50 text-azure-700',
  ENTERPRISE: 'bg-amber-50 text-amber-700',
}
const STATUS_COLORS = {
  ACTIVE:  'badge-green',
  EXPIRED: 'badge-red',
  TRIAL:   'badge-amber',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtCurrency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)
}

// ── Edit modal component ──────────────────────────────────────────────────────
function EditModal({ college, open, onClose, onSaved }) {
  const [form, setForm] = useState({
    plan: '', status: '', expiresAt: '', paymentId: '',
    amount: '', provider: '', transactionId: '', paymentStatus: 'COMPLETED',
  })
  const [saving, setSaving] = useState(false)
  const { show, ToastContainer } = useToast()

  useEffect(() => {
    if (college?.subscription) {
      setForm(f => ({
        ...f,
        plan:      college.subscription.plan      || '',
        status:    college.subscription.status    || '',
        expiresAt: college.subscription.expiresAt
          ? new Date(college.subscription.expiresAt).toISOString().slice(0, 10)
          : '',
        paymentId: college.subscription.paymentId || '',
      }))
    }
  }, [college])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {}
      if (form.plan)       body.plan       = form.plan
      if (form.status)     body.status     = form.status
      if (form.expiresAt)  body.expiresAt  = new Date(form.expiresAt).toISOString()
      else                 body.expiresAt  = null
      if (form.paymentId)  body.paymentId  = form.paymentId
      // Optional payment record
      if (form.amount && form.provider) {
        body.amount        = Number(form.amount)
        body.provider      = form.provider
        body.transactionId = form.transactionId || undefined
        body.paymentStatus = form.paymentStatus
      }
      await subscriptionApi.adminUpdateCollegeSubscription(college._id, body)
      show('Subscription updated ✅')
      onSaved()
      onClose()
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  })

  return (
    <>
      <Modal open={open} onClose={onClose} title={`Edit subscription — ${college?.name}`} size="lg">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Subscription fields */}
          <div>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">Subscription</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="label">Plan</label>
                <select className="input" {...f('plan')}>
                  <option value="">— unchanged —</option>
                  {['FREE', 'PRO', 'ENTERPRISE'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Status</label>
                <select className="input" {...f('status')}>
                  <option value="">— unchanged —</option>
                  {['ACTIVE', 'TRIAL', 'EXPIRED'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Expires at</label>
                <input type="date" className="input" {...f('expiresAt')} />
              </div>
            </div>
            <div className="form-group mt-3">
              <label className="label">Payment ID (optional reference)</label>
              <input className="input" placeholder="e.g. pay_xyz123" {...f('paymentId')} />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-ink-100 pt-4">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">
              Log a payment <span className="font-normal normal-case text-ink-400">(optional — only if amount + provider are filled)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Amount (₹)</label>
                <input type="number" min="0" className="input" placeholder="e.g. 4999" {...f('amount')} />
              </div>
              <div className="form-group">
                <label className="label">Provider</label>
                <select className="input" {...f('provider')}>
                  <option value="">Select provider</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="STRIPE">Stripe</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Transaction ID</label>
                <input className="input" placeholder="e.g. txn_abc" {...f('transactionId')} />
              </div>
              <div className="form-group">
                <label className="label">Payment status</label>
                <select className="input" {...f('paymentStatus')}>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Saving…</>
                : <><Icon name="check" className="w-4 h-4" />Save</>
              }
            </button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SuperCollegesBilling() {
  const [colleges, setColleges] = useState([])
  const [revenue,  setRevenue]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      subscriptionApi.adminColleges(),
      subscriptionApi.adminRevenue(),
    ])
      .then(([c, r]) => {
        setColleges(Array.isArray(c) ? c : [])
        setRevenue(r)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = colleges.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Colleges & billing</h1>
          <p className="page-sub">Manage subscriptions for all colleges</p>
        </div>
      </div>

      {/* Revenue KPIs */}
      {revenue && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="Total revenue"
            value={fmtCurrency(revenue.totalRevenue)}
            icon="chart"
            color="green"
          />
          <StatCard
            label="Total payments"
            value={revenue.paymentCount}
            icon="award"
            color="blue"
          />
          {revenue.byProvider?.map(p => (
            <StatCard
              key={p.provider}
              label={p.provider}
              value={fmtCurrency(p.total)}
              sub={`${p.count} payment${p.count !== 1 ? 's' : ''}`}
              icon="document"
              color="amber"
            />
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            className="input pl-9"
            placeholder="Search college name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Colleges table */}
      {filtered.length === 0 ? (
        <div className="card p-16">
          <EmptyState icon="building" title="No colleges found" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table" style={{ minWidth: 680 }}>
            <thead>
              <tr>
                <th>College</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Payment ID</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const sub = c.subscription
                return (
                  <tr key={c._id}>
                    <td>
                      <div>
                        <p className="font-semibold text-ink-900 text-sm">{c.name}</p>
                        <p className="text-xs text-ink-400">{c.code}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge text-xs font-semibold px-2.5 py-0.5 rounded-full ${PLAN_COLORS[sub?.plan] || 'bg-ink-100 text-ink-600'}`}>
                        {sub?.plan || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[sub?.status] || 'badge-gray'}`}>
                        {sub?.status || '—'}
                      </span>
                    </td>
                    <td className="text-sm text-ink-600">{fmtDate(sub?.expiresAt)}</td>
                    <td>
                      {sub?.paymentId
                        ? <code className="text-xs bg-ink-50 border border-ink-200 px-1.5 py-0.5 rounded">{sub.paymentId}</code>
                        : <span className="text-ink-300 text-xs">—</span>
                      }
                    </td>
                    <td className="text-xs text-ink-400">{fmtDate(c.createdAt)}</td>
                    <td>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => setEditTarget(c)}
                      >
                        <Icon name="pencil" className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      <EditModal
        college={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={load}
      />
    </div>
  )
}
