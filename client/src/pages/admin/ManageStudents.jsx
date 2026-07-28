// client/src/pages/admin/ManageStudents.jsx
import { useState, useEffect, useCallback } from 'react'
import { usersApi, adminApi } from '@/services/api'
import { SearchInput, StatusBadge, Modal, Icon, Spinner, EmptyState, useToast } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export default function ManageStudents() {
  const { user } = useAuth()

  const [students,     setStudents]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [departments,  setDepartments]  = useState([])
  const [semesters,    setSemesters]    = useState([])
  const [filteredSems, setFilteredSems] = useState([])

  const [showCreate,   setShowCreate]   = useState(false)
  const [creating,     setCreating]     = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', departmentId: '', semesterId: '',
  })

  const [showAssign,     setShowAssign]     = useState(null)
  const [assignDeptId,   setAssignDeptId]   = useState('')
  const [assignSemId,    setAssignSemId]    = useState('')
  const [assignFiltered, setAssignFiltered] = useState([])

  const { show, ToastContainer } = useToast()

  // ── load students ────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams({ role: 'STUDENT', ...(search && { search }) }).toString()
    usersApi.list(q)
      .then(d => setStudents(d.users || []))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  // ── load dropdowns once ──────────────────────────────────────────
  useEffect(() => {
    adminApi.listDepartments().then(d => setDepartments(Array.isArray(d) ? d : []))
    adminApi.listSemesters().then(d => setSemesters(Array.isArray(d) ? d : []))
  }, [])

  // ── filter semesters by dept (create form) ───────────────────────
  useEffect(() => {
    setFilteredSems(
      !form.departmentId
        ? semesters
        : semesters.filter(s =>
            (s.department?._id ?? s.department) === form.departmentId
          )
    )
    setForm(f => ({ ...f, semesterId: '' }))
  }, [form.departmentId, semesters])

  // ── filter semesters by dept (assign modal) ──────────────────────
  useEffect(() => {
    setAssignFiltered(
      !assignDeptId
        ? semesters
        : semesters.filter(s =>
            (s.department?._id ?? s.department) === assignDeptId
          )
    )
    setAssignSemId('')
  }, [assignDeptId, semesters])

  // ── CREATE student then immediately assign semester if selected ──
  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      // Step 1 — create the user account
      const created = await usersApi.create({
        name:    form.name,
        email:   form.email,
        role:    'STUDENT',
        college: user.college,
      })

      // Step 2 — assign semester right away if one was chosen
      if (form.semesterId && created?.user?.id) {
        try {
          await adminApi.assignStudentSemester({
            studentId:  created.user.id,
            semesterId: form.semesterId,
          })
          show('Student created and semester assigned ✅')
        } catch {
          // student was created but semester assign failed — let them know
          show('Student created but semester assignment failed. Use "Assign semester" to set it manually.', 'error')
        }
      } else {
        show('Student created successfully ✅')
      }

      setShowCreate(false)
      resetForm()
      load()
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  // ── ASSIGN semester (edit modal) ─────────────────────────────────
  const handleAssign = async () => {
    if (!assignSemId || !showAssign) return
    try {
      await adminApi.assignStudentSemester({
        studentId:  showAssign._id,
        semesterId: assignSemId,
      })
      show('Semester assigned ✅')
      setShowAssign(null)
      load()
    } catch (err) { show(err.message, 'error') }
  }

  const resetForm = () =>
    setForm({ name: '', email: '', departmentId: '', semesterId: '' })

  const openAssign = (student) => {
    setShowAssign(student)
    setAssignDeptId('')
    setAssignSemId(student.semester?._id || '')
    setAssignFiltered(semesters)
  }

  // ── helpers ──────────────────────────────────────────────────────
  const getDeptName = (student) => {
    const semId = student.semester?._id || student.semester
    if (!semId) return null
    const sem = semesters.find(s => s._id === semId || s._id === semId?.toString())
    return sem?.department?.name || null
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-sub">Manage all enrolled students</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" className="w-4 h-4" /> Add student
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : students.length === 0 ? (
          <EmptyState icon="users" title="No students found" description="Add your first student to get started" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-jade-50 text-jade-600 flex items-center justify-center text-xs font-semibold">
                        {u.name?.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-ink-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-ink-500 text-sm">{u.email}</td>
                  <td>
                    {getDeptName(u)
                      ? <span className="badge-blue">{getDeptName(u)}</span>
                      : <span className="text-ink-300 text-xs">—</span>}
                  </td>
                  <td>
                    {u.semester?.name
                      ? <span className="text-sm font-medium text-ink-800">{u.semester.name}</span>
                      : <span className="text-ink-400 text-xs italic">Not assigned</span>}
                  </td>
                  <td><StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td className="text-xs text-ink-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-ghost btn-sm" onClick={() => openAssign(u)}>
                      <Icon name="pencil" className="w-3.5 h-3.5" /> Assign semester
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── CREATE modal ── */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); resetForm() }}
        title="Add new student"
      >
        <form onSubmit={handleCreate} className="space-y-4">

          <div className="form-group">
            <label className="label">Full name</label>
            <input className="input" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Rahul Sharma" />
          </div>

          <div className="form-group">
            <label className="label">Email address</label>
            <input type="email" className="input" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="rahul@college.edu" />
          </div>

          {/* Department */}
          <div className="form-group">
            <label className="label">Department</label>
            <select className="input" value={form.departmentId}
              onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
              <option value="">Select department</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Semester — filtered by dept, saved on create */}
          <div className="form-group">
            <label className="label">
              Semester
              <span className="ml-1 text-jade-600 font-normal normal-case text-xs">
                — will be saved automatically
              </span>
            </label>
            <select className="input" value={form.semesterId}
              onChange={e => setForm(f => ({ ...f, semesterId: e.target.value }))}>
              <option value="">Select semester (optional)</option>
              {filteredSems.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name}{s.department?.name ? ` — ${s.department.name}` : ''}
                </option>
              ))}
            </select>
            {form.departmentId && filteredSems.length === 0 && (
              <p className="text-xs text-coral-500 mt-1">
                No semesters for this department. Create one first.
              </p>
            )}
          </div>

          <div className="p-3 bg-ink-50 rounded-xl text-xs text-ink-500">
            Default password:{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-ink-200 font-mono">
              password123
            </code>
            {' '}— student should change on first login.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost"
              onClick={() => { setShowCreate(false); resetForm() }}>
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-1" />Creating…</>
                : 'Create student'
              }
            </button>
          </div>
        </form>
      </Modal>

      {/* ── ASSIGN SEMESTER modal ── */}
      <Modal
        open={!!showAssign}
        onClose={() => setShowAssign(null)}
        title="Assign semester"
        size="sm"
      >
        <div className="space-y-4">
          {/* Student pill */}
          <div className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-jade-50 text-jade-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {showAssign?.name?.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">{showAssign?.name}</p>
              <p className="text-xs text-ink-500">{showAssign?.email}</p>
            </div>
          </div>

          {/* Department filter */}
          <div className="form-group">
            <label className="label">Filter by department</label>
            <select className="input" value={assignDeptId}
              onChange={e => setAssignDeptId(e.target.value)}>
              <option value="">All departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="form-group">
            <label className="label">Semester</label>
            <select className="input" value={assignSemId}
              onChange={e => setAssignSemId(e.target.value)}>
              <option value="">Choose semester…</option>
              {assignFiltered.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name}{s.department?.name ? ` — ${s.department.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setShowAssign(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleAssign} disabled={!assignSemId}>
              <Icon name="check" className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  )
}
