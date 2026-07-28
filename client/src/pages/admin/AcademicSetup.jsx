// client/src/pages/admin/AcademicSetup.jsx
import { useState, useEffect } from 'react'
import { adminApi, teacherApi } from '@/services/api'
import { Modal, Icon, Spinner, EmptyState, useToast, Select } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

/* ── DEPARTMENTS ── */
export function DepartmentsPage() {
  const { user } = useAuth()
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const { show, ToastContainer } = useToast()

  const load = () => { setLoading(true); adminApi.listDepartments().then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false)) }
  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      // COLLEGE_ADMIN: college is injected from their own context server-side
      await adminApi.createDepartment({ name })
      show('Department created'); setShowCreate(false); setName(''); load()
    } catch (err) { show(err.message, 'error') }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div><h1 className="page-title">Departments</h1><p className="page-sub">Manage academic departments</p></div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Icon name="plus" className="w-4 h-4" /> Add department</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><Spinner /></div>
        : items.length === 0 ? <div className="card p-16"><EmptyState icon="building" title="No departments yet" description="Create your first department" /></div>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(d => (
              <div key={d._id} className="card p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-azure-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="building" className="w-5 h-5 text-azure-500" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900 text-sm">{d.name}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create department" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label className="label">Department name</label>
            <input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Science" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </div>
  )
}

/* ── SEMESTERS ── */
export function SemestersPage() {
  const [items, setItems]   = useState([])
  const [depts, setDepts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', department: '' })
  const { show, ToastContainer } = useToast()

  const load = () => { setLoading(true); adminApi.listSemesters().then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false)) }
  useEffect(() => { load(); adminApi.listDepartments().then(d => setDepts(Array.isArray(d) ? d : [])) }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await adminApi.createSemester(form)
      show('Semester created'); setShowCreate(false); setForm({ name: '', department: '' }); load()
    } catch (err) { show(err.message, 'error') }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div><h1 className="page-title">Semesters</h1><p className="page-sub">Academic semester management</p></div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Icon name="plus" className="w-4 h-4" /> Add semester</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><Spinner /></div>
        : items.length === 0 ? <div className="card p-16"><EmptyState icon="calendar" title="No semesters yet" description="Create your first semester" /></div>
        : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Semester</th><th>Department</th><th>Created</th></tr></thead>
              <tbody>
                {items.map(s => (
                  <tr key={s._id}>
                    <td className="font-medium text-ink-900">{s.name}</td>
                    <td className="text-ink-500">{s.department?.name || '—'}</td>
                    <td className="text-xs text-ink-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create semester" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label className="label">Semester name</label>
            <input className="input" required value={form.name}
              onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Semester 3" />
          </div>
          <div className="form-group">
            <label className="label">Department</label>
            <Select value={form.department} onChange={v => setForm(f => ({...f, department: v}))}
              options={depts.map(d => ({ value: d._id, label: d.name }))} placeholder="Select department" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!form.department}>Create</button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </div>
  )
}

/* ── SUBJECTS ── */
export function SubjectsPage() {
  const [items, setItems]   = useState([])
  const [sems, setSems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAssign, setShowAssign] = useState(null)
  const [form, setForm] = useState({ name: '', semester: '' })
  const [assignForm, setAssignForm] = useState({ subjectId: '', teacherId: '' })
  const { show, ToastContainer } = useToast()

  const load = () => { setLoading(true); adminApi.listSubjects().then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false)) }
  useEffect(() => { load(); adminApi.listSemesters().then(d => setSems(Array.isArray(d) ? d : [])) }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await adminApi.createSubject(form)
      show('Subject created'); setShowCreate(false); setForm({ name: '', semester: '' }); load()
    } catch (err) { show(err.message, 'error') }
  }

  const handleAssignTeacher = async () => {
    try {
      await teacherApi.assignSubject({
        subjectId: showAssign._id,
        teacherId: assignForm.teacherId,
      })
      show('Teacher assigned'); setShowAssign(null); setAssignForm({ subjectId: '', teacherId: '' }); load()
    } catch (err) { show(err.message, 'error') }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div><h1 className="page-title">Subjects</h1><p className="page-sub">Manage course subjects and assign teachers</p></div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Icon name="plus" className="w-4 h-4" /> Add subject</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><Spinner /></div>
        : items.length === 0 ? <div className="card p-16"><EmptyState icon="book" title="No subjects yet" description="Create your first subject" /></div>
        : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Subject</th><th>Semester</th><th>Teacher</th><th></th></tr></thead>
              <tbody>
                {items.map(s => (
                  <tr key={s._id}>
                    <td className="font-medium text-ink-900">{s.name}</td>
                    <td className="text-ink-500 text-sm">{s.semester?.name || '—'}</td>
                    <td>
                      {s.teacher
                        ? <span className="badge-blue">{s.teacher.name}</span>
                        : <span className="text-xs text-ink-400 italic">Unassigned</span>}
                    </td>
                    <td>
                      <button className="btn-ghost btn-sm" onClick={() => setShowAssign(s)}>
                        <Icon name="academic" className="w-3.5 h-3.5" /> Assign teacher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Create subject modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create subject" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label className="label">Subject name</label>
            <input className="input" required value={form.name}
              onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Data Structures" />
          </div>
          <div className="form-group">
            <label className="label">Semester</label>
            <Select value={form.semester} onChange={v => setForm(f => ({...f, semester: v}))}
              options={sems.map(s => ({ value: s._id, label: s.name }))} placeholder="Select semester" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!form.semester}>Create</button>
          </div>
        </form>
      </Modal>

      {/* Assign teacher modal */}
      <Modal open={!!showAssign} onClose={() => setShowAssign(null)} title={`Assign teacher — ${showAssign?.name}`} size="sm">
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Teacher ID</label>
            <input className="input" value={assignForm.teacherId}
              onChange={e => setAssignForm(f => ({...f, teacherId: e.target.value}))}
              placeholder="Paste teacher's MongoDB ObjectId" />
            <p className="text-xs text-ink-400 mt-1">Go to Teachers page → copy the teacher's ID from browser DevTools or use the API.</p>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setShowAssign(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleAssignTeacher} disabled={!assignForm.teacherId}>Assign</button>
          </div>
        </div>
      </Modal>
      <ToastContainer />
    </div>
  )
}
