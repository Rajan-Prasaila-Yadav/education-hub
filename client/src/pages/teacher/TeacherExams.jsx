// src/pages/teacher/TeacherExams.jsx
import { useState, useEffect } from 'react'
import { examsApi } from '@/services/api'
import { Modal, Icon, Spinner, EmptyState, StatusBadge, useToast } from '@/components/ui'

export default function TeacherExams() {
  const [exams, setExams]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showResults, setShowResults] = useState(null)
  const [results, setResults] = useState([])
  const [form, setForm] = useState({ title:'', subjectId:'', semesterId:'', maxMarks:100, passMarks:'' })
  const { show, ToastContainer } = useToast()

  const load = () => {
    setLoading(true)
    examsApi.mine().then(setExams).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await examsApi.create(form)
      show('Exam created')
      setShowCreate(false)
      setForm({ title:'', subjectId:'', semesterId:'', maxMarks:100, passMarks:'' })
      load()
    } catch (err) { show(err.message, 'error') }
  }

  const viewResults = async (exam) => {
    setShowResults(exam)
    const data = await examsApi.examResults(exam._id)
    setResults(data.results || [])
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-sub">Create and manage your exams</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" className="w-4 h-4" /> Create exam
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : exams.length === 0 ? (
        <div className="card p-16">
          <EmptyState icon="award" title="No exams yet" description="Create your first exam to start entering marks" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map(exam => (
            <div key={exam._id} className="card-hover p-5 group" onClick={() => viewResults(exam)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Icon name="award" className="w-5 h-5 text-amber-500" />
                </div>
                <Icon name="chevron_right" className="w-4 h-4 text-ink-300 group-hover:text-ink-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-ink-900 text-sm mb-1">{exam.title}</h3>
              <p className="text-xs text-ink-500 mb-3">{exam.subject?.name} · {exam.semester?.name}</p>
              <div className="flex gap-2">
                <span className="badge-blue">Max: {exam.maxMarks}</span>
                <span className="badge-amber">Pass: {exam.passMarks}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create exam">
        <form onSubmit={handleCreate} className="space-y-4">
          {[
            { label:'Title', key:'title', type:'text', placeholder:'e.g. Mid-semester exam' },
            { label:'Subject ID', key:'subjectId', type:'text', placeholder:'ObjectId' },
            { label:'Semester ID', key:'semesterId', type:'text', placeholder:'ObjectId' },
            { label:'Max marks', key:'maxMarks', type:'number', placeholder:'100' },
            { label:'Pass marks (optional)', key:'passMarks', type:'number', placeholder:'Auto: 40%' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="label">{f.label}</label>
              <input type={f.type} className="input" value={form[f.key]}
                onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                placeholder={f.placeholder} required={f.key !== 'passMarks'} />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create exam</button>
          </div>
        </form>
      </Modal>

      {/* Results modal */}
      <Modal open={!!showResults} onClose={() => { setShowResults(null); setResults([]) }} title={`Results — ${showResults?.title}`} size="lg">
        {results.length === 0 ? (
          <EmptyState icon="chart" title="No results yet" description="Enter marks for this exam" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Marks</th>
                <th>Max</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r._id}>
                  <td>{r.student?.name}</td>
                  <td className="font-semibold">{r.marks}</td>
                  <td className="text-ink-400">{showResults?.maxMarks}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>

      <ToastContainer />
    </div>
  )
}
