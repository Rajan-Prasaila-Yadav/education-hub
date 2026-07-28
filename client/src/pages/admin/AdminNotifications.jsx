// src/pages/admin/AdminNotifications.jsx
import { useState } from 'react'
import { notificationsApi } from '@/services/api'
import { Icon, useToast, Spinner } from '@/components/ui'

const TYPE_OPTIONS = ['GENERAL','ATTENDANCE','RESULT','NOTE','EXAM']
const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'All students' },
  { value: 'TEACHER', label: 'All teachers' },
]

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: '', message: '', type: 'GENERAL', roles: ['STUDENT'] })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(null)
  const { show, ToastContainer } = useToast()

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role]
    }))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await notificationsApi.create({ ...form, roles: form.roles })
      setSent(result)
      show(`Notification sent to ${result.count} recipients`, 'success')
      setForm({ title: '', message: '', type: 'GENERAL', roles: ['STUDENT'] })
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Send notification</h1>
          <p className="page-sub">Broadcast announcements to students and teachers</p>
        </div>
      </div>

      {sent && (
        <div className="mb-6 p-4 bg-jade-50 border border-jade-500/20 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 bg-jade-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="check" className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-jade-700">Notification sent!</p>
            <p className="text-xs text-jade-600">Delivered to {sent.count} recipients</p>
          </div>
          <button className="ml-auto text-jade-500 hover:text-jade-700" onClick={() => setSent(null)}>
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="card p-6 space-y-5">
        {/* Recipients */}
        <div>
          <label className="label">Recipients</label>
          <div className="flex gap-2 flex-wrap mt-2">
            {ROLE_OPTIONS.map(r => (
              <button key={r.value} type="button"
                onClick={() => toggleRole(r.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  form.roles.includes(r.value)
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-ink-600 border-ink-200 hover:border-ink-400'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="form-group">
          <label className="label">Notification type</label>
          <div className="flex gap-2 flex-wrap">
            {TYPE_OPTIONS.map(t => (
              <button key={t} type="button"
                onClick={() => setForm(f => ({...f, type: t}))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  form.type === t
                    ? 'bg-azure-500 text-white border-azure-500'
                    : 'bg-white text-ink-500 border-ink-200 hover:border-azure-300'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="label">Title</label>
          <input className="input" required value={form.title}
            onChange={e => setForm(f => ({...f, title: e.target.value}))}
            placeholder="e.g. Internal exam schedule released" maxLength={120} />
        </div>

        {/* Message */}
        <div className="form-group">
          <label className="label">Message</label>
          <textarea className="input resize-none" required rows={5}
            value={form.message}
            onChange={e => setForm(f => ({...f, message: e.target.value}))}
            placeholder="Write your announcement here…" maxLength={500} />
          <p className="text-xs text-ink-400 mt-1 text-right">{form.message.length}/500</p>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading || form.roles.length === 0} className="btn-primary gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : <><Icon name="bell" className="w-4 h-4" /> Send notification</>}
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  )
}
