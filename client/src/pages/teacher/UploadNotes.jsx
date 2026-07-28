// client/src/pages/teacher/UploadNotes.jsx
import { useState, useEffect } from 'react'
import { notesApi, teacherApi } from '@/services/api'
import { Icon, useToast, Spinner } from '@/components/ui'

export default function UploadNotes() {
  const [mySubjects,  setMySubjects]  = useState([])
  const [mySemesters, setMySemesters] = useState([])   // derived from subjects
  const [initLoading, setInitLoading] = useState(true)

  const [form, setForm] = useState({ title: '', subjectId: '', semesterId: '' })
  const [file,     setFile]     = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [uploaded, setUploaded] = useState([])

  const { show, ToastContainer } = useToast()

  // ── Load teacher's subjects, derive semesters from them ──
  useEffect(() => {
    teacherApi.dashboard()
      .then(data => {
        const subs = data.subjects || []
        setMySubjects(subs)

        // Derive unique semesters from subject.semester (populated by backend)
        const semMap = {}
        subs.forEach(s => {
          if (s.semester && s.semester._id) {
            semMap[s.semester._id] = s.semester
          }
        })
        setMySemesters(Object.values(semMap))
      })
      .catch(err => show('Failed to load subjects: ' + err.message, 'error'))
      .finally(() => setInitLoading(false))
  }, [])

  // When subject changes, auto-select its semester
  const handleSubjectChange = subjectId => {
    const subject = mySubjects.find(s => s._id === subjectId)
    const semesterId = subject?.semester?._id || ''
    setForm(f => ({ ...f, subjectId, semesterId }))
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
    else show('Only PDF files are allowed', 'error')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title)      return show('Please enter a title', 'error')
    if (!form.subjectId)  return show('Please select a subject', 'error')
    if (!form.semesterId) return show('Please select a semester', 'error')
    if (!file)            return show('Please select a PDF file', 'error')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title',      form.title)
      fd.append('subjectId',  form.subjectId)
      fd.append('semesterId', form.semesterId)
      fd.append('file',       file)

      await notesApi.upload(fd)
      show('✅ Notes uploaded! Students have been notified.')

      setUploaded(prev => [{
        title:   form.title,
        subject: mySubjects.find(s => s._id === form.subjectId)?.name || '',
        file:    file.name,
        size:    (file.size / 1024).toFixed(1) + ' KB',
        date:    new Date().toLocaleDateString(),
      }, ...prev])

      setForm({ title: '', subjectId: '', semesterId: '' })
      setFile(null)
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (initLoading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload notes</h1>
          <p className="page-sub">Share PDF study materials with your students</p>
        </div>
      </div>

      {mySubjects.length === 0 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">No subjects assigned to you</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Ask your college admin to assign subjects before uploading notes.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* Title */}
        <div className="form-group">
          <label className="label">Note title</label>
          <input
            className="input"
            required
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Chapter 3 — Linked Lists"
          />
        </div>

        {/* Subject + Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Subject</label>
            <select
              className="input"
              required
              value={form.subjectId}
              onChange={e => handleSubjectChange(e.target.value)}
            >
              <option value="">Select your subject</option>
              {mySubjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Semester</label>
            <select
              className="input"
              required
              value={form.semesterId}
              onChange={e => setForm(f => ({ ...f, semesterId: e.target.value }))}
            >
              <option value="">Select semester</option>
              {mySemesters.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            {form.subjectId && form.semesterId && (
              <p className="text-xs text-jade-600 mt-1">✓ Auto-filled from subject</p>
            )}
          </div>
        </div>

        {/* Drop zone */}
        <div>
          <label className="label">PDF file</label>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('note-file-input').click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragging
                ? 'border-azure-400 bg-azure-50'
                : file
                ? 'border-jade-400 bg-jade-50'
                : 'border-ink-200 hover:border-ink-400 hover:bg-ink-50'
            }`}
          >
            <input
              id="note-file-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]) }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-jade-100 rounded-xl flex items-center justify-center">
                  <Icon name="document" className="w-6 h-6 text-jade-600" />
                </div>
                <p className="text-sm font-semibold text-jade-700">{file.name}</p>
                <p className="text-xs text-jade-500">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  className="text-xs text-coral-500 hover:text-coral-700 mt-1 underline"
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-400">
                <Icon name="upload" className="w-8 h-8" />
                <p className="text-sm font-medium">
                  Drop your PDF here, or{' '}
                  <span className="text-azure-500 font-semibold">browse</span>
                </p>
                <p className="text-xs">PDF files only · Max 10 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-ink-400">
            Students in the selected semester will be notified automatically.
          </p>
          <button
            type="submit"
            disabled={loading || mySubjects.length === 0}
            className="btn-primary"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Uploading…</>
              : <><Icon name="upload" className="w-4 h-4" />Upload notes</>
            }
          </button>
        </div>
      </form>

      {/* Recently uploaded */}
      {uploaded.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-ink-700 mb-3">Uploaded this session</p>
          <div className="space-y-2">
            {uploaded.map((n, i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-jade-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="document" className="w-4 h-4 text-jade-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{n.title}</p>
                  <p className="text-xs text-ink-500">{n.subject} · {n.size} · {n.date}</p>
                </div>
                <span className="badge-green">Uploaded</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}
