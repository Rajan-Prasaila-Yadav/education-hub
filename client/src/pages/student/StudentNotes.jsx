// src/pages/student/StudentNotes.jsx
import { useState, useEffect } from 'react'
import { studentApi } from '@/services/api'
import { Spinner, EmptyState, Icon, SearchInput } from '@/components/ui'

export default function StudentNotes() {
  const [notes, setNotes]   = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentApi.notes().then(setNotes).finally(() => setLoading(false))
  }, [])

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-sub">Study materials uploaded by your teachers</p>
        </div>
      </div>

      <div className="mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search notes or subjects…" />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16">
          <EmptyState icon="book" title="No notes yet" description="Notes uploaded by your teachers will appear here." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(n => (
            <a
              key={n._id}
              href={n.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover p-5 group flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 bg-azure-50 rounded-xl flex items-center justify-center">
                  <Icon name="document" className="w-5 h-5 text-azure-500" />
                </div>
                <span className="w-7 h-7 rounded-lg bg-ink-50 group-hover:bg-azure-50 flex items-center justify-center transition-colors">
                  <Icon name="eye" className="w-3.5 h-3.5 text-ink-400 group-hover:text-azure-500 transition-colors" />
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-900 leading-snug line-clamp-2">{n.title}</h3>
                <p className="text-xs text-ink-500 mt-1">{n.subject?.name}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-ink-100">
                <span className="text-xs text-ink-400">{n.uploadedBy?.name}</span>
                <span className="text-xs text-ink-400">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}


// src/pages/student/StudentToday.jsx — exported separately below
