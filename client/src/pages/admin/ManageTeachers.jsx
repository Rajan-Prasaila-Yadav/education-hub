// client/src/pages/admin/ManageTeachers.jsx
import { useState, useEffect, useCallback } from 'react'
import { usersApi } from '@/services/api'
import { SearchInput, StatusBadge, Modal, Icon, Spinner, EmptyState, useToast } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export default function ManageTeachers() {
  const { user } = useAuth()
  const [users, setUsers]   = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'TEACHER' })
  const { show, ToastContainer } = useToast()

  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams({ role: 'TEACHER', ...(search && { search }) }).toString()
    usersApi.list(q).then(d => setUsers(d.users || [])).finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await usersApi.create({ ...form, college: user.college })
      show('Teacher account created')
      setShowCreate(false)
      setForm({ name: '', email: '', role: 'TEACHER' })
      load()
    } catch (err) { show(err.message, 'error') }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div><h1 className="page-title">Teachers</h1><p className="page-sub">Faculty management</p></div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" className="w-4 h-4" /> Add teacher
        </button>
      </div>

      <div className="mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search teachers…" />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : users.length === 0 ? (
          <EmptyState icon="academic" title="No teachers found" />
        ) : (
          <table className="table">
            <thead><tr><th>Teacher</th><th>Email</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-azure-50 text-azure-600 flex items-center justify-center text-xs font-semibold">
                        {u.name?.split(' ').map(w => w[0]).slice(0,2).join('')}
                      </div>
                      <span className="font-medium text-ink-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-ink-500">{u.email}</td>
                  <td><StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td className="text-xs text-ink-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add new teacher">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label className="label">Full name</label>
            <input className="input" required value={form.name}
              onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Dr. Smith" />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="teacher@college.edu" />
          </div>
          <p className="text-xs text-ink-400 bg-ink-50 rounded-xl px-4 py-3">
            Default password: <code className="bg-ink-100 px-1 rounded">password123</code>
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create teacher</button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </div>
  )
}
