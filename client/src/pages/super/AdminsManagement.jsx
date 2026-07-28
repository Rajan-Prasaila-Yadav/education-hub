// client/src/pages/super/AdminsManagement.jsx
// SUPER_ADMIN only — view all college admins across all colleges
import { useState, useEffect } from 'react'
import { usersApi } from '@/services/api'
import { StatCard, Spinner, EmptyState, Icon } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminsManagement() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch all users and filter for admins with role COLLEGE_ADMIN (returns { users: [...], pagination: {...} })
        const res = await usersApi.list('role=COLLEGE_ADMIN')
        const adminsList = res?.users || []
        setAdmins(adminsList)
        
        // Calculate stats
        const totalAdmins = adminsList.length || 0
        const activeAdmins = adminsList.filter(a => a.isActive !== false).length || 0
        
        setStats({ totalAdmins, activeAdmins })
      } catch (err) {
        console.error('Error fetching admins:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

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
          <h1 className="page-title">College Admins</h1>
          <p className="page-sub">View and manage all college administrators.</p>
        </div>
        <p className="text-xs text-ink-400 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard label="Total Admins" value={stats?.totalAdmins} icon="users" color="blue" />
        <StatCard label="Active" value={stats?.activeAdmins} icon="check" color="green" />
        <StatCard label="Inactive" value={(stats?.totalAdmins || 0) - (stats?.activeAdmins || 0)} icon="chart" color="blue" />
      </div>

      {/* Admins table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="heading-section text-sm text-ink-900">All Admins</p>
          <span className="text-xs text-ink-400">{admins.length} total</span>
        </div>
        
        {admins.length === 0 ? (
          <EmptyState icon="users" title="No admins found" desc="No college administrators registered yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100">
                <tr className="text-ink-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">College</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {admins.map(admin => (
                  <tr key={admin._id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink-900">{admin.name}</td>
                    <td className="px-4 py-3 text-ink-600 text-xs">{admin.email}</td>
                    <td className="px-4 py-3 text-ink-600">{admin.college?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${admin.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                        {admin.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-600 text-xs">
                      {admin.createdAt 
                        ? new Date(admin.createdAt).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
