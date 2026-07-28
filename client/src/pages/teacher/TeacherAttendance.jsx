// client/src/pages/teacher/TeacherAttendance.jsx
import { useState, useEffect, useCallback } from 'react'
import { attendanceApi, teacherApi, usersApi } from '@/services/api'
import { Icon, Spinner, useToast } from '@/components/ui'

export default function TeacherAttendance() {
  const [todayClasses,   setTodayClasses]   = useState([])
  const [allSubjects,    setAllSubjects]     = useState([])
  const [todayStatus,    setTodayStatus]     = useState([]) // already-marked slots
  const [showingToday,   setShowingToday]    = useState(true)

  const [students,       setStudents]        = useState([])
  const [records,        setRecords]         = useState({})
  const [searchStudent,  setSearchStudent]   = useState('')

  // selected slot — use timetable _id as unique key, not subjectId
  const [selectedSlot,   setSelectedSlot]    = useState(null)
  // { timetableId, subjectId, semesterId, subjectName, semesterName, startTime, endTime }

  const [form, setForm] = useState({
    subjectId:  '',
    semesterId: '',
    date: new Date().toISOString().slice(0, 10),
  })

  const [initLoading,     setInitLoading]     = useState(true)
  const [studentsLoaded,  setStudentsLoaded]  = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting,      setSubmitting]      = useState(false)
  const [submitted,       setSubmitted]       = useState(false)
  const [isEditMode,      setIsEditMode]      = useState(false)

  const { show, ToastContainer } = useToast()

  // ── load all data ────────────────────────────────────────────────
  const loadInitial = useCallback(() => {
    setInitLoading(true)
    Promise.all([
      teacherApi.today(),
      teacherApi.dashboard(),
      attendanceApi.todayStatus(),
    ])
      .then(([todayData, dashData, statusData]) => {
        setTodayClasses(Array.isArray(todayData) ? todayData : [])
        setAllSubjects(dashData.subjects || [])
        setTodayStatus(Array.isArray(statusData) ? statusData : [])
      })
      .catch(err => show('Could not load data: ' + err.message, 'error'))
      .finally(() => setInitLoading(false))
  }, [])

  useEffect(() => { loadInitial() }, [loadInitial])

  // ── check if a slot is already marked ───────────────────────────
  const getSlotStatus = (subjectId, semesterId) =>
    todayStatus.find(
      s => s.subjectId === subjectId && s.semesterId === semesterId
    ) || null

  // ── select a timetable slot ──────────────────────────────────────
  const handleSelectSlot = (slot) => {
    if (submitted) return
    setSelectedSlot(slot)
    setForm(f => ({ ...f, subjectId: slot.subjectId, semesterId: slot.semesterId }))
    setStudentsLoaded(false)
    setStudents([])
    setRecords({})
    setSubmitted(false)
    setIsEditMode(false)
    setSearchStudent('')
  }

  // ── load students ────────────────────────────────────────────────
  const handleLoadStudents = async () => {
    if (!form.subjectId || !form.semesterId) return show('Select a class first', 'error')
    setLoadingStudents(true)
    setStudentsLoaded(false)
    setStudents([])
    setSubmitted(false)
    try {
      const data = await usersApi.list(`role=STUDENT&semester=${form.semesterId}`)
      const list = data.users || []
      if (list.length === 0) {
        show('No students in this semester. Ask admin to assign students.', 'error')
      } else {
        setStudents(list)
        const init = {}
        list.forEach(u => { init[u._id] = 'PRESENT' })
        setRecords(init)
        setStudentsLoaded(true)
        setIsEditMode(false)
      }
    } catch (err) {
      show('Failed to load students: ' + err.message, 'error')
    } finally {
      setLoadingStudents(false)
    }
  }

  // ── edit already-marked slot ─────────────────────────────────────
  const handleEditSlot = async (slot) => {
    setSelectedSlot(slot)
    setForm(f => ({ ...f, subjectId: slot.subjectId, semesterId: slot.semesterId }))
    setSubmitted(false)
    setIsEditMode(true)
    setStudentsLoaded(false)
    setStudents([])
    setLoadingStudents(true)
    setSearchStudent('')
    try {
      const data = await usersApi.list(`role=STUDENT&semester=${slot.semesterId}`)
      const list = data.users || []
      if (list.length > 0) {
        setStudents(list)
        const init = {}
        list.forEach(u => { init[u._id] = 'PRESENT' })
        setRecords(init)
        setStudentsLoaded(true)
      }
    } catch (err) {
      show('Failed to load students: ' + err.message, 'error')
    } finally {
      setLoadingStudents(false)
    }
  }

  const toggleAll = status => {
    const next = {}
    students.forEach(u => { next[u._id] = status })
    setRecords(next)
  }

  const toggle = (id) =>
    setRecords(r => ({ ...r, [id]: r[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT' }))

  // ── submit ───────────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault()
    if (!studentsLoaded || students.length === 0) return show('Load students first', 'error')
    setSubmitting(true)
    try {
      const recs = students.map(u => ({
        student: u._id,
        status:  records[u._id] || 'ABSENT',
      }))
      await attendanceApi.mark({ ...form, records: recs })
      setSubmitted(true)
      show(isEditMode ? '✅ Attendance updated!' : `✅ Attendance saved for ${recs.length} students!`)
      // Refresh today status so the card updates to "Marked"
      attendanceApi.todayStatus().then(s => setTodayStatus(Array.isArray(s) ? s : []))
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedSlot(null)
    setStudents([])
    setStudentsLoaded(false)
    setRecords({})
    setSubmitted(false)
    setIsEditMode(false)
    setSearchStudent('')
    setForm(f => ({ ...f, subjectId: '', semesterId: '' }))
  }

  // ── derived ──────────────────────────────────────────────────────
  const presentCount     = Object.values(records).filter(v => v === 'PRESENT').length
  const absentCount      = students.length - presentCount
  const visibleStudents  = students.filter(u =>
    !searchStudent ||
    u.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    u.email.toLowerCase().includes(searchStudent.toLowerCase())
  )
  const shortId = id => id?.slice(-6)?.toUpperCase() || '—'

  if (initLoading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  return (
    <div className="animate-fade-up max-w-4xl">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mark attendance</h1>
          <p className="page-sub">Record student attendance for a class session</p>
        </div>
        {(studentsLoaded || submitted) && (
          <button type="button" className="btn-ghost text-ink-500" onClick={handleReset}>
            <Icon name="x" className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="mb-5 p-4 bg-jade-50 border border-jade-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-jade-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="check" className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-jade-800">
                {isEditMode ? 'Attendance updated!' : 'Attendance saved!'}
              </p>
              <p className="text-xs text-jade-600">
                {presentCount} present · {absentCount} absent ·{' '}
                {selectedSlot?.subjectName} · {form.date}
              </p>
            </div>
          </div>
          <button onClick={handleReset} className="btn-primary btn-sm">
            Mark another class
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── Step 1 ── */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest">
              Step 1 — Select class details
            </p>
            {/* Today / All toggle */}
            <div className="flex items-center bg-ink-100 rounded-xl p-1 gap-1">
              {[
                { key: true,  label: "Today's classes" },
                { key: false, label: 'All subjects' },
              ].map(opt => (
                <button key={String(opt.key)} type="button"
                  onClick={() => { setShowingToday(opt.key); handleReset() }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    showingToday === opt.key
                      ? 'bg-ink-900 text-white shadow-sm'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── TODAY MODE ── */}
          {showingToday && (
            <>
              {todayClasses.length === 0 ? (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-base mt-0.5">📅</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">No classes scheduled today</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Switch to <strong>All subjects</strong> to mark attendance manually.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-xs text-ink-500 mb-2">Select a class from today's timetable:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {todayClasses.map(c => {
                      const slotKey     = c._id                              // unique per timetable entry
                      const isSelected  = selectedSlot?.timetableId === slotKey && !submitted
                      const markedStatus = getSlotStatus(c.subject?._id, c.semester?._id)
                      const isMarked    = !!markedStatus

                      return (
                        <div key={slotKey} className={`relative rounded-xl border-2 overflow-hidden transition-all
                          ${isSelected
                            ? 'border-ink-900 bg-ink-900'
                            : isMarked
                            ? 'border-jade-300 bg-jade-50'
                            : 'border-ink-200 bg-white hover:border-ink-400 cursor-pointer'
                          }`}
                          onClick={() => !isMarked && handleSelectSlot({
                            timetableId:  c._id,
                            subjectId:    c.subject?._id,
                            semesterId:   c.semester?._id,
                            subjectName:  c.subject?.name,
                            semesterName: c.semester?.name,
                            startTime:    c.startTime,
                            endTime:      c.endTime,
                          })}
                        >
                          <div className="flex items-center gap-3 p-3.5">
                            {/* Time block */}
                            <div className={`flex-shrink-0 px-2.5 py-2 rounded-lg text-center min-w-[58px] ${
                              isSelected ? 'bg-white/10' : isMarked ? 'bg-jade-100' : 'bg-ink-50'
                            }`}>
                              <p className={`text-xs font-bold font-mono ${
                                isSelected ? 'text-white' : isMarked ? 'text-jade-700' : 'text-ink-700'
                              }`}>{c.startTime}</p>
                              <div className={`h-px my-0.5 ${
                                isSelected ? 'bg-white/30' : isMarked ? 'bg-jade-200' : 'bg-ink-200'
                              }`} />
                              <p className={`text-xs font-mono ${
                                isSelected ? 'text-white/70' : isMarked ? 'text-jade-500' : 'text-ink-400'
                              }`}>{c.endTime}</p>
                            </div>

                            {/* Subject info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${
                                isSelected ? 'text-white' : 'text-ink-900'
                              }`}>{c.subject?.name}</p>
                              <p className={`text-xs truncate ${
                                isSelected ? 'text-white/70' : 'text-ink-500'
                              }`}>{c.semester?.name}</p>
                            </div>

                            {/* Status badge / icon */}
                            {isMarked ? (
                              <div className="flex-shrink-0 flex items-center gap-1.5">
                                <div className="flex flex-col items-end gap-1">
                                  <span className="badge-green text-xs">
                                    {markedStatus.presentCount}/{markedStatus.totalCount} present
                                  </span>
                                </div>
                                {/* Edit button */}
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleEditSlot({
                                      timetableId:  c._id,
                                      subjectId:    c.subject?._id,
                                      semesterId:   c.semester?._id,
                                      subjectName:  c.subject?.name,
                                      semesterName: c.semester?.name,
                                    })
                                  }}
                                  className="w-7 h-7 rounded-lg bg-jade-100 hover:bg-jade-200 flex items-center justify-center transition-colors"
                                  title="Edit attendance"
                                >
                                  <Icon name="pencil" className="w-3.5 h-3.5 text-jade-700" />
                                </button>
                              </div>
                            ) : isSelected ? (
                              <Icon name="check" className="w-4 h-4 text-white flex-shrink-0" />
                            ) : (
                              <Icon name="chevron_right" className="w-4 h-4 text-ink-300 flex-shrink-0" />
                            )}
                          </div>

                          {/* "Already marked" label */}
                          {isMarked && (
                            <div className="px-3.5 pb-2.5 flex items-center gap-1.5">
                              <span className="text-xs text-jade-600 font-medium">✓ Attendance marked</span>
                              <span className="text-xs text-jade-400">— click ✏️ to edit</span>
                            </div>
                          )}

                          {/* Edit mode indicator */}
                          {isEditMode && selectedSlot?.timetableId === slotKey && (
                            <div className="px-3.5 pb-2.5">
                              <span className="text-xs text-amber-600 font-medium">✏️ Editing attendance</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ALL SUBJECTS MODE ── */}
          {!showingToday && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="label">Subject</label>
                <select className="input" value={form.subjectId}
                  onChange={e => {
                    const sub = allSubjects.find(s => s._id === e.target.value)
                    setSelectedSlot({ subjectId: e.target.value, semesterId: sub?.semester?._id || '', subjectName: sub?.name })
                    setForm(f => ({ ...f, subjectId: e.target.value, semesterId: sub?.semester?._id || '' }))
                    setStudentsLoaded(false); setStudents([]); setRecords({})
                  }}>
                  <option value="">Select subject</option>
                  {allSubjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Semester</label>
                <input className="input bg-ink-50" readOnly
                  value={allSubjects.find(s => s._id === form.subjectId)?.semester?.name || '—'}
                  placeholder="Auto-filled from subject" />
              </div>
            </div>
          )}

          {/* Date + Load button */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="form-group flex-shrink-0">
              <label className="label">Date</label>
              <input type="date" className="input w-44" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                disabled={submitted} />
            </div>

            {!submitted && (
              <button type="button" onClick={handleLoadStudents}
                disabled={!form.subjectId || !form.semesterId || loadingStudents}
                className={`mb-0.5 ${isEditMode ? 'btn-ghost border border-amber-300 text-amber-700 hover:bg-amber-50' : 'btn-primary'}`}>
                {loadingStudents
                  ? <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block mr-2" />Loading…</>
                  : isEditMode
                  ? <><Icon name="pencil" className="w-4 h-4" /> Reload for edit</>
                  : <><Icon name="users" className="w-4 h-4" /> Load students</>
                }
              </button>
            )}

            {studentsLoaded && !submitted && (
              <span className="text-xs font-semibold text-jade-600 mb-1">
                {isEditMode ? '✏️' : '✅'} {students.length} student{students.length !== 1 ? 's' : ''} {isEditMode ? '— editing' : 'loaded'}
              </span>
            )}
          </div>
        </div>

        {/* ── Step 2 — Student cards ── */}
        {studentsLoaded && students.length > 0 && (
          <>
            <div className="card overflow-hidden mb-4">
              {/* Toolbar */}
              <div className="px-5 py-3.5 bg-ink-50 border-b border-ink-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest">
                    Step 2 — {isEditMode ? 'Edit attendance' : 'Mark attendance'}
                  </p>
                  <span className="badge-green">{presentCount} P</span>
                  <span className="badge-red">{absentCount} A</span>
                  {isEditMode && (
                    <span className="badge-amber text-xs">Editing mode</span>
                  )}
                </div>
                {!submitted && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
                      <input type="text" className="input pl-8 py-1.5 text-xs w-40"
                        placeholder="Search student…"
                        value={searchStudent}
                        onChange={e => setSearchStudent(e.target.value)} />
                    </div>
                    <button type="button" onClick={() => toggleAll('PRESENT')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-jade-50 text-jade-700 border border-jade-200 hover:bg-jade-100 transition-colors">
                      All P
                    </button>
                    <button type="button" onClick={() => toggleAll('ABSENT')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-coral-50 text-coral-700 border border-coral-200 hover:bg-coral-100 transition-colors">
                      All A
                    </button>
                  </div>
                )}
              </div>

              {/* Student card grid */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleStudents.map((u, i) => {
                  const isPresent = records[u._id] === 'PRESENT'
                  return (
                    <div key={u._id}
                      onClick={() => !submitted && toggle(u._id)}
                      className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200
                        ${submitted ? 'cursor-default' : 'cursor-pointer hover:shadow-md active:scale-[0.98]'}
                        ${isPresent ? 'border-jade-300 bg-jade-50' : 'border-coral-200 bg-coral-50'}`}>
                      <div className={`h-1 w-full ${isPresent ? 'bg-jade-400' : 'bg-coral-400'}`} />
                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                              ${isPresent ? 'bg-jade-200 text-jade-800' : 'bg-coral-200 text-coral-800'}`}>
                              {u.name?.split(' ').map(w => w[0]).slice(0, 2).join('')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink-900 truncate leading-tight">{u.name}</p>
                              <p className="text-xs text-ink-400 truncate">{u.email}</p>
                            </div>
                          </div>
                          {!submitted ? (
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition-all
                              ${isPresent ? 'bg-jade-500 text-white border-jade-500' : 'bg-coral-500 text-white border-coral-500'}`}>
                              {isPresent ? 'P' : 'A'}
                            </div>
                          ) : (
                            <span className={`flex-shrink-0 badge ${isPresent ? 'badge-green' : 'badge-red'}`}>
                              {isPresent ? 'Present' : 'Absent'}
                            </span>
                          )}
                        </div>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="text-xs text-ink-400">ID:</span>
                          <code className={`text-xs font-mono px-2 py-0.5 rounded-md font-semibold
                            ${isPresent ? 'bg-jade-100 text-jade-700' : 'bg-coral-100 text-coral-700'}`}>
                            #{shortId(u._id)}
                          </code>
                          <span className="ml-auto text-xs text-ink-400">#{i + 1}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {visibleStudents.length === 0 && (
                  <div className="col-span-3 py-8 text-center text-ink-400 text-sm">
                    No students match "{searchStudent}"
                  </div>
                )}
              </div>

              {/* Summary footer */}
              <div className="px-5 py-3 bg-ink-50 border-t border-ink-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-ink-500">Total: <strong className="text-ink-900">{students.length}</strong></span>
                  <span className="text-jade-600">Present: <strong>{presentCount}</strong></span>
                  <span className="text-coral-600">Absent: <strong>{absentCount}</strong></span>
                  {students.length > 0 && (
                    <span className="text-ink-500">Rate:{' '}
                      <strong className={presentCount / students.length >= 0.75 ? 'text-jade-600' : 'text-coral-600'}>
                        {Math.round((presentCount / students.length) * 100)}%
                      </strong>
                    </span>
                  )}
                </div>
                {!submitted && <p className="text-xs text-ink-400">Click a card to toggle P / A</p>}
              </div>
            </div>

            {/* Submit */}
            {!submitted && (
              <div className="flex justify-end">
                <button type="submit" disabled={submitting} className="btn-primary px-8">
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Saving…</>
                    : isEditMode
                    ? <><Icon name="pencil" className="w-4 h-4" /> Update attendance</>
                    : <><Icon name="check" className="w-4 h-4" /> Submit attendance</>
                  }
                </button>
              </div>
            )}
          </>
        )}
      </form>
      <ToastContainer />
    </div>
  )
}
