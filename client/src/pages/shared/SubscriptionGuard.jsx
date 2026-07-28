// client/src/components/shared/SubscriptionGuard.jsx
// Drop this inside your root App or AppShell.
// It listens for subscription errors emitted by the api.js fetch layer
// and shows a toast + optional redirect to billing.
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function SubscriptionGuard() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuth()

  useEffect(() => {
    const handler = (e) => {
      const { code, message } = e.detail

      // ── 402 SUBSCRIPTION_EXPIRED ──────────────────────────────────────────
      if (code === 'SUBSCRIPTION_EXPIRED') {
        // Show a non-blocking banner — redirect COLLEGE_ADMIN to billing
        if (user?.role === 'COLLEGE_ADMIN' && !location.pathname.includes('/admin/billing')) {
          // Use a small timeout so the current page renders first
          setTimeout(() => navigate('/admin/billing', { replace: false }), 400)
        }
        // For other roles (TEACHER, STUDENT) just let the page show the error toast
        // (already thrown as Error in api.js — each page's catch block shows it)
      }

      // ── 403 PLAN_FREE_LIMIT ───────────────────────────────────────────────
      // Don't redirect — just let the existing toast from the page handle it.
      // The message is already descriptive ("requires PRO or ENTERPRISE plan").
    }

    window.addEventListener('eduxo:subscription_error', handler)
    return () => window.removeEventListener('eduxo:subscription_error', handler)
  }, [navigate, location, user])

  return null   // no visual output — side-effects only
}
