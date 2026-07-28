// client/src/pages/super/SuperColleges.jsx
// SUPER_ADMIN only — view all colleges with stats and management options
import { useState, useEffect } from 'react'
import { subscriptionApi, adminApi } from '@/services/api'
import { StatCard, Spinner, EmptyState, Icon, Modal, useToast } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export default function SuperColleges() {
  const { user } = useAuth()
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', plan: 'FREE' })
  const [editingCollege, setEditingCollege] = useState(null)
  const [editForm, setEditForm] = useState({ plan: 'FREE', status: 'ACTIVE', expiresAt: '' })
  const [editing, setEditing] = useState(false)
  const { show, ToastContainer } = useToast()

  const refreshColleges = async () => {
    try {
      const collegesList = await subscriptionApi.adminColleges()
      setColleges(Array.isArray(collegesList) ? collegesList : [])
      
      const totalColleges = Array.isArray(collegesList) ? collegesList.length : 0
      const activeColleges = Array.isArray(collegesList) ? collegesList.filter(c => c.subscription?.status === 'ACTIVE').length : 0
      const expiredSubs = Array.isArray(collegesList) ? collegesList.filter(c => c.subscription?.status === 'EXPIRED').length : 0
      
      setStats({ totalColleges, activeColleges, expiredSubs })
    } catch (err) {
      console.error('Error fetching colleges:', err)
    }
  }

  useEffect(() => {
    setLoading(true)
    refreshColleges().finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      // Create the college
      const college = await adminApi.createCollege({ name: form.name, address: form.address })
      
      // Update subscription with plan
      if (college?._id) {
        await subscriptionApi.adminUpdateCollegeSubscription(college._id, {
          plan: form.plan,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
      
      show(`College created with ${form.plan} plan ✅`)
      setForm({ name: '', address: '', plan: 'FREE' })
      setShowCreate(false)
      await refreshColleges()
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (college) => {
    setEditingCollege(college)
    setEditForm({
      plan: college.subscription?.plan || 'FREE',
      status: college.subscription?.status || 'ACTIVE',
      expiresAt: college.subscription?.expiresAt
        ? new Date(college.subscription.expiresAt).toISOString().split('T')[0]
        : ''
    })
  }

  const handleUpdateSubscription = async (e) => {
    e.preventDefault()
    setEditing(true)
    try {
      await subscriptionApi.adminUpdateCollegeSubscription(editingCollege._id, {
        plan: editForm.plan,
        status: editForm.status,
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null
      })
      show('Subscription updated ✅')
      setEditingCollege(null)
      await refreshColleges()
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setEditing(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="text-sm text-ink-500 mb-0.5">{greeting()},</p>
          <h1 className="page-title">{user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Manage all colleges and their subscriptions.</p>
        </div>
        <p className="text-xs text-ink-400 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard label="Total Colleges" value={stats?.totalColleges} icon="building" color="blue" />
        <StatCard label="Active Subscriptions" value={stats?.activeColleges} icon="check" color="green" />
        <StatCard label="Expired Plans" value={stats?.expiredSubs} icon="chart" color="red" />
      </div>

      {/* Colleges table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="heading-section text-sm text-ink-900">All Colleges</p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary text-sm"
          >
            <Icon name="plus" className="w-4 h-4" />
            Add College
          </button>
        </div>
        
        {colleges.length === 0 ? (
          <EmptyState icon="building" title="No colleges yet" desc="Add colleges to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100">
                <tr className="text-ink-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">College Name</th>
                  <th className="px-4 py-2 text-left">Admin</th>
                  <th className="px-4 py-2 text-left">Plan</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {colleges.map(college => (
                  <tr key={college._id} className="hover:bg-ink-50 transition-colors cursor-pointer" onClick={() => handleEdit(college)}>
                    <td className="px-4 py-3 font-medium text-ink-900">{college.name}</td>
                    <td className="px-4 py-3 text-ink-600">{college.admin?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${college.subscription?.plan === 'ENTERPRISE' ? 'bg-amber-50 text-amber-700' :
                          college.subscription?.plan === 'PRO' ? 'bg-azure-50 text-azure-700' :
                          'bg-ink-100 text-ink-600'}`}>
                        {college.subscription?.plan || 'FREE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${college.subscription?.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                          college.subscription?.status === 'EXPIRED' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'}`}>
                        {college.subscription?.status || 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-600 text-xs">
                      {college.subscription?.expiresAt 
                        ? new Date(college.subscription.expiresAt).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New College" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">College Name</label>
            <input
              type="text"
              required
              placeholder="e.g., IIT Delhi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Address</label>
            <textarea
              required
              placeholder="College address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input w-full resize-none"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Subscription Plan</label>
            <select
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              className="input w-full"
            >
              <option value="FREE">Free Plan</option>
              <option value="PRO">Pro Plan</option>
              <option value="ENTERPRISE">Enterprise Plan</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn text-sm bg-ink-100 text-ink-900 hover:bg-ink-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary text-sm"
            >
              {creating ? <Spinner size="sm" /> : <>Create College</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit subscription modal */}
      <Modal open={!!editingCollege} onClose={() => setEditingCollege(null)} title="Edit Subscription" size="md">
        {editingCollege && (
          <form onSubmit={handleUpdateSubscription} className="space-y-4">
            <div className="bg-ink-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-ink-900">{editingCollege.name}</p>
              <p className="text-xs text-ink-500 mt-0.5">{editingCollege.address}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Plan</label>
              <select
                value={editForm.plan}
                onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                className="input w-full"
              >
                <option value="FREE">Free Plan</option>
                <option value="PRO">Pro Plan</option>
                <option value="ENTERPRISE">Enterprise Plan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="input w-full"
              >
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Expires On</label>
              <input
                type="date"
                value={editForm.expiresAt}
                onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                className="input w-full"
              />
              <p className="text-xs text-ink-400 mt-1">Leave blank for no expiration</p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setEditingCollege(null)}
                className="btn text-sm bg-ink-100 text-ink-900 hover:bg-ink-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editing}
                className="btn btn-primary text-sm"
              >
                {editing ? <Spinner size="sm" /> : <>Update Subscription</>}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ToastContainer />
    </div>
  )
}

