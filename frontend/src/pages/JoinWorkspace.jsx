import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { workspaceAPI } from '../services/api.js'

export default function JoinWorkspace() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState('joining') // 'joining' | 'error' | 'success'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login', { state: { redirectTo: `/join/${code}` } })
      return
    }

    let cancelled = false

    const join = async () => {
      try {
        const res = await workspaceAPI.joinByCode(code)
        if (cancelled) return
        setStatus('success')
        setTimeout(() => {
          navigate('/dashboard', { state: { selectWorkspaceId: res.data.id }, replace: true })
        }, 800)
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setErrorMsg(
          err.response?.data?.message ||
            'Failed to join workspace. The invite link may be invalid or expired.'
        )
      }
    }

    join()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, code])

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        {status === 'joining' && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="font-body-md text-secondary">Joining workspace…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <span className="material-symbols-outlined mb-3 text-4xl text-primary">
              check_circle
            </span>
            <p className="font-body-md text-on-surface">
              You're in! Redirecting to your dashboard…
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <span className="material-symbols-outlined mb-3 text-4xl text-red-500">
              error
            </span>
            <p className="mb-4 font-body-md text-on-surface">{errorMsg}</p>
            <Link
              to="/dashboard"
              className="inline-block rounded-xl bg-primary px-4 py-2 font-label-md font-bold text-white hover:bg-primary/90"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
