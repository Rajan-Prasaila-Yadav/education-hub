// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/services/api'
import { Spinner } from '@/components/ui'

const ROLE_REDIRECT = {
  SUPER_ADMIN: '/super/colleges',
  COLLEGE_ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authApi.login(form)
      login(user, token)
      navigate(ROLE_REDIRECT[user.role] || '/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-azure-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-volt-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-ink-800 rounded-2xl border border-ink-700 mb-4">
            <span className="text-volt-500 font-display font-bold text-2xl">E</span>
          </div>
          <h1 className="heading-display text-3xl text-white">Welcome back</h1>
          <p className="text-ink-400 text-sm mt-2">Sign in to EduXo</p>
        </div>

        {/* Card */}
        <div className="bg-ink-900/80 backdrop-blur border border-ink-700 rounded-3xl p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-coral-500/10 border border-coral-500/30 rounded-xl text-coral-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="label text-ink-400">Email address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-ink-700 bg-ink-800 text-white text-sm placeholder:text-ink-600 focus:outline-none focus:border-azure-500 focus:ring-2 focus:ring-azure-500/20 transition-all"
                placeholder="you@college.edu"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="label text-ink-400">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-ink-700 bg-ink-800 text-white text-sm placeholder:text-ink-600 focus:outline-none focus:border-azure-500 focus:ring-2 focus:ring-azure-500/20 transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-volt-500 hover:bg-volt-400 text-ink-900 font-semibold font-display rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              {loading ? <Spinner size="sm" /> : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <a href="/forgot-password" className="text-sm text-ink-500 hover:text-azure-400 transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>

        <p className="text-center text-ink-700 text-xs mt-6">
          EduXo College Management Platform
        </p>
      </div>
    </div>
  )
}
