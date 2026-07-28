// client/src/pages/super/AuditLog.jsx
// SUPER_ADMIN only — view system-wide audit logs across all operations
import { useState, useEffect } from 'react'
import { auditApi } from '@/services/api'
import { Spinner, EmptyState, Icon } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export default function AuditLog() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ action: '', user: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch all audit logs (returns array directly)
        const data = await auditApi.logs()
        const logsList = Array.isArray(data) ? data : []
        
        let filtered = logsList
        
        // Client-side filtering
        if (filter.action) {
          filtered = filtered.filter(log => 
            log.action.toLowerCase().includes(filter.action.toLowerCase())
          )
        }
        if (filter.user) {
          filtered = filtered.filter(log =>
            log.user?.name?.toLowerCase().includes(filter.user.toLowerCase()) ||
            log.userId?.toLowerCase().includes(filter.user.toLowerCase())
          )
        }
        
        setLogs(filtered)
      } catch (err) {
        console.error('Error fetching audit logs:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [filter])

  const getActionColor = (action) => {
    if (action?.includes('CREATE') || action?.includes('ADD')) return 'bg-green-50 text-green-700'
    if (action?.includes('UPDATE') || action?.includes('EDIT')) return 'bg-blue-50 text-blue-700'
    if (action?.includes('DELETE') || action?.includes('REMOVE')) return 'bg-red-50 text-red-700'
    if (action?.includes('LOGIN')) return 'bg-purple-50 text-purple-700'
    return 'bg-ink-50 text-ink-700'
  }

  const getActionIcon = (action) => {
    if (action?.includes('CREATE') || action?.includes('ADD')) return 'plus'
    if (action?.includes('UPDATE') || action?.includes('EDIT')) return 'pencil'
    if (action?.includes('DELETE') || action?.includes('REMOVE')) return 'x'
    if (action?.includes('LOGIN')) return 'check'
    return 'document'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-sub">System-wide activity and changes across all operations.</p>
        </div>
        <p className="text-xs text-ink-400 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">Action</label>
            <input
              type="text"
              placeholder="Filter by action..."
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">User</label>
            <input
              type="text"
              placeholder="Filter by user..."
              value={filter.user}
              onChange={(e) => setFilter({ ...filter, user: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Logs timeline */}
      <div className="space-y-3">
        {!logs || logs.length === 0 ? (
          <div className="card p-8">
            <EmptyState icon="document" title="No audit logs" desc="No activity found matching your filters" />
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={log._id || idx} className="card p-4 border-l-4 border-ink-200 hover:border-ink-300 transition-colors">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(log.action)}`}>
                  <Icon name={getActionIcon(log.action)} className="w-4 h-4" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink-900 text-sm">{log.action}</p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        by <span className="font-medium">{log.user?.name || log.userId || 'Unknown'}</span>
                        {log.college && ` • ${log.college.name}`}
                      </p>
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0
                      ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  
                  {/* Description */}
                  {log.description && (
                    <p className="text-xs text-ink-600 mt-2 line-clamp-2">{log.description}</p>
                  )}
                  
                  {/* Changes */}
                  {log.changes && (
                    <div className="text-xs text-ink-500 mt-2 bg-ink-50 p-2 rounded font-mono">
                      {typeof log.changes === 'string' ? log.changes : JSON.stringify(log.changes).slice(0, 100)}...
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <p className="text-xs text-ink-400 mt-2">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
