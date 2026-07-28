// src/pages/admin/AdminTimetable.jsx
import { useState, useEffect } from 'react'
import { timetableApi, adminApi } from '@/services/api'
import { Modal, Select, Icon, Spinner, EmptyState, StatusBadge, useToast } from '@/components/ui'

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
const DAY_SHORT = { MONDAY:'Mon',TUESDAY:'Tue',WEDNESDAY:'Wed',THURSDAY:'Thu',FRIDAY:'Fri',SATURDAY:'Sat' }

export default function AdminTimetable() {
  const [entries, setEntries] = useState([])
  const [semesters, setSemesters] = useState([])
  const [semFilter, setSemFilter] = useState('')
  const [loading, setLoading]   = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ subject:'', semester:'', teacher:'', day:'MONDAY', startTime:'09:00', endTime:'10:00' })
  const { show, ToastContainer } = useToast()

  const load = () => {
    setLoading(true)
    const q = semFilter ? `semester=${semFilter}` : ''
    timetableApi.list(q).then(d => setEntries(d.timetable || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [semFilter])
  useEffect(() => { adminApi.listSemesters().then(setSemesters) }, [])

  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = entries.filter(e => e.day === d)
    return acc
  }, {})

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await timetableApi.create(form)
      show('Timetable entry created')
      setShowCreate(false)
      load()
    } catch (err) { show(err.message, 'error') }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Timetable</h1>
          <p className="page-sub">Weekly schedule for all semesters</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={semFilter} onChange={setSemFilter}
            options={semesters.map(s => ({ value: s._id, label: s.name }))}
            placeholder="All semesters" className="w-44" />
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Icon name="plus" className="w-4 h-4" /> Add slot
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {DAYS.map(day => (
            <div key={day} className="card overflow-hidden">
              <div className="px-5 py-3 bg-ink-50 border-b border-ink-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
                  <span className="text-volt-500 text-xs font-display font-bold">{DAY_SHORT[day]}</span>
                </div>
                <span className="heading-section text-sm text-ink-900">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                <span className="ml-auto text-xs text-ink-400">{grouped[day].length} class{grouped[day].length !== 1 ? 'es' : ''}</span>
              </div>
              {grouped[day].length === 0 ? (
                <p className="px-5 py-4 text-sm text-ink-400 italic">No classes scheduled</p>
              ) : (
                <div className="divide-y divide-ink-50">
                  {grouped[day].map(e => (
                    <div key={e._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-50/50 transition-colors">
                      <div className="text-xs text-ink-500 font-mono w-28 flex-shrink-0">
                        {e.startTime} – {e.endTime}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">{e.subject?.name}</p>
                        <p className="text-xs text-ink-500">{e.teacher?.name} · {e.semester?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create timetable slot">
        <form onSubmit={handleCreate} className="space-y-4">
          {[
            { label: 'Semester ID', key: 'semester', placeholder: 'ObjectId' },
            { label: 'Subject ID',  key: 'subject',  placeholder: 'ObjectId' },
            { label: 'Teacher ID',  key: 'teacher',  placeholder: 'ObjectId' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="label">{f.label}</label>
              <input className="input" required value={form[f.key]}
                onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                placeholder={f.placeholder} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Day</label>
              <select className="input" value={form.day} onChange={e => setForm(p => ({...p, day: e.target.value}))}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Start time</label>
              <input type="time" className="input" value={form.startTime} onChange={e => setForm(p => ({...p, startTime: e.target.value}))} />
            </div>
            <div className="form-group col-span-2">
              <label className="label">End time</label>
              <input type="time" className="input" value={form.endTime} onChange={e => setForm(p => ({...p, endTime: e.target.value}))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <ToastContainer />
    </div>
  )
}
