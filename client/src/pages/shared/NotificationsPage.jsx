// src/pages/shared/NotificationsPage.jsx
import { useState, useEffect } from 'react'
import { notificationsApi } from '@/services/api'
import { Icon, Spinner, EmptyState } from '@/components/ui'

const TYPE_COLOR = {
  NOTE: 'bg-azure-50 text-azure-600',
  ATTENDANCE: 'bg-jade-50 text-jade-600',
  RESULT: 'bg-amber-50 text-amber-600',
  EXAM: 'bg-amber-50 text-amber-600',
  GENERAL: 'bg-ink-100 text-ink-600',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    notificationsApi.my().then(setNotifications).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const markRead = async (id) => {
    await notificationsApi.markRead(id)
    setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x))
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-sub">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-ghost text-sm"
            onClick={() => notifications.filter(n => !n.isRead).forEach(n => markRead(n.id))}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <div className="card p-16">
          <EmptyState icon="bell" title="No notifications" description="You're all caught up. Nothing new here." />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id}
              className={`card p-4 flex items-start gap-4 transition-all duration-200 ${!n.isRead ? 'border-l-4 border-azure-400' : 'opacity-75 hover:opacity-100'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${TYPE_COLOR[n.type] || TYPE_COLOR.GENERAL}`}>
                {n.type === 'NOTE' ? '📄' : n.type === 'ATTENDANCE' ? '✅' : n.type === 'RESULT' ? '🏆' : '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.isRead ? 'text-ink-900' : 'text-ink-600'}`}>{n.title}</p>
                  <span className="text-xs text-ink-400 flex-shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-ink-500 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-azure-50 text-azure-500 hover:bg-azure-100 flex items-center justify-center transition-colors">
                  <Icon name="check" className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
