// src/components/ui/index.jsx
import { useState } from 'react'

/* ── Icons (inline SVG, no dependency) ── */
export function Icon({ name, className = 'w-5 h-5' }) {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>,
    users: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>,
    book: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>,
    bell: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>,
    chart: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>,
    x: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>,
    upload: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>,
    eye:  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>,
    logout: <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>,
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>,
    academic: <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>,
    pencil: <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>,
    filter: <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>,
    chevron_right: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>,
    chevron_down: <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>,
    building: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>,
    document: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>,
    award: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>,
    menu: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>,
    settings: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>,
    'chevron-left': <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>,
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      {icons[name] || null}
    </svg>
  )
}

/* ── Spinner ── */
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={`${s} border-2 border-ink-200 border-t-azure-500 rounded-full animate-spin`} />
  )
}

/* ── Loading screen ── */
export function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-ink-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-ink-200 border-t-azure-500 rounded-full animate-spin" />
        <p className="text-sm text-ink-400 font-medium">Loading…</p>
      </div>
    </div>
  )
}

/* ── Empty state ── */
export function EmptyState({ icon = 'document', title = 'Nothing here yet', description }) {
  return (
    <div className="empty-state gap-3">
      <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-300 mb-2">
        <Icon name={icon} className="w-7 h-7" />
      </div>
      <p className="font-semibold text-ink-600 text-base">{title}</p>
      {description && <p className="text-sm text-ink-400 max-w-xs">{description}</p>}
    </div>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-up`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-100">
          <h3 className="heading-section text-lg text-ink-900">{title}</h3>
          <button className="btn-icon" onClick={onClose}><Icon name="x" className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* ── Toast ── */
export function Toast({ message, type = 'success', onClose }) {
  const styles = {
    success: 'bg-jade-500 text-white',
    error: 'bg-coral-500 text-white',
    info: 'bg-azure-500 text-white',
  }
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium animate-fade-up ${styles[type]}`}>
      {message}
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><Icon name="x" className="w-4 h-4" /></button>
    </div>
  )
}

/* ── Stat card ── */
export function StatCard({ label, value, sub, color = 'blue', icon }) {
  const colors = {
    blue:   'bg-azure-50  text-azure-500',
    green:  'bg-jade-50   text-jade-500',
    amber:  'bg-amber-50  text-amber-500',
    red:    'bg-coral-50  text-coral-500',
    volt:   'bg-volt-500/10 text-volt-700',
  }
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{label}</span>
        {icon && <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon name={icon} className="w-4.5 h-4.5" />
        </div>}
      </div>
      <div>
        <p className="heading-display text-3xl text-ink-900">{value ?? '—'}</p>
        {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Avatar initials ── */
export function Avatar({ name = '?', size = 'md', color = 'blue' }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = {
    blue:  'bg-azure-50  text-azure-600',
    green: 'bg-jade-50   text-jade-600',
    volt:  'bg-volt-500/20 text-volt-700',
    amber: 'bg-amber-50  text-amber-600',
    coral: 'bg-coral-50  text-coral-600',
  }
  const sizes = { sm: 'avatar-sm', md: 'avatar-md', lg: 'avatar-lg' }
  return <div className={`${sizes[size]} ${colors[color]} font-display`}>{initials}</div>
}

/* ── Search input ── */
export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
      <input className="input pl-9 pr-4 py-2 text-sm" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

/* ── Progress ring (for attendance %) ── */
export function ProgressRing({ pct = 0, size = 64, stroke = 5 }) {
  const r = (size - stroke * 2) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  const color = pct >= 75 ? '#00C896' : pct >= 50 ? '#FFB800' : '#FF5757'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E8F0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fontSize="12" fontWeight="600" fill={color}>{pct}%</text>
    </svg>
  )
}

/* ── Inline select ── */
export function Select({ value, onChange, options = [], placeholder = 'Select…', className = '' }) {
  return (
    <select
      className={`input ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

/* ── Status badge ── */
export function StatusBadge({ status }) {
  const map = {
    PASS: 'badge-green', FAIL: 'badge-red',
    PRESENT: 'badge-green', ABSENT: 'badge-red',
    ACTIVE: 'badge-blue', INACTIVE: 'badge-gray',
    TEACHER: 'badge-blue', STUDENT: 'badge-green',
    COLLEGE_ADMIN: 'badge-amber', SUPER_ADMIN: 'badge-gray',
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

/* ── useToast hook ── */
export function useToast() {
  const [toasts, setToasts] = useState([])
  const show = (message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }
  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(x => x.filter(i => i.id !== t.id))} />)}
    </div>
  )
  return { show, ToastContainer }
}
