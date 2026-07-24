import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthSidePanel from '../components/AuthSidePanel.jsx'
import { GoogleIcon, GithubIcon } from '../components/icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup, loading, error, clearError } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    const result = await signup(name, email, password)
    if (result.success) {
      navigate(location.state?.redirectTo || '/dashboard')
    }
  }

  const errorMessage = localError || error

  return (
    <main className="flex min-h-screen overflow-hidden bg-surface">
      <AuthSidePanel />

      {/* Right Section: Signup Form */}
      <section className="flex w-full items-center justify-center bg-surface-container-lowest p-margin-page lg:w-1/2">
        <div className="w-full max-w-[420px] space-y-stack-lg">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container shadow-sm">
                <span
                  className="material-symbols-outlined text-[24px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  terminal
                </span>
              </div>
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary-container">
                Codexa
              </span>
            </div>
            <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
              Create your account
            </h1>
            <p className="font-body-md text-body-md text-secondary">
              Start building with your team in minutes.
            </p>
          </div>

          {/* Social Sign Up */}
          <div className="space-y-stack-sm">
            <button className="group flex h-12 w-full items-center justify-center gap-stack-sm rounded-xl border border-outline-variant bg-surface transition-all hover:scale-[1.01] hover:bg-surface-container-low active:scale-[0.98]">
              <GoogleIcon />
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Sign up with Google
              </span>
            </button>
            <button className="group flex h-12 w-full items-center justify-center gap-stack-sm rounded-xl border border-outline-variant bg-surface transition-all hover:scale-[1.01] hover:bg-surface-container-low active:scale-[0.98]">
              <GithubIcon />
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Sign up with GitHub
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="mx-4 flex-shrink font-label-md text-label-md uppercase tracking-widest text-secondary">
              OR
            </span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Traditional Form */}
          <form className="space-y-stack-md" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="ml-1 font-label-md text-label-md text-secondary"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-body-md outline-none transition-all placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="ml-1 font-label-md text-label-md text-secondary"
                htmlFor="email"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-body-md outline-none transition-all placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="ml-1 font-label-md text-label-md text-secondary"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-body-md outline-none transition-all placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="ml-1 font-label-md text-label-md text-secondary"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-body-md outline-none transition-all placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-primary-container font-label-md text-label-md font-bold text-white shadow-md transition-all hover:bg-primary active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="pt-2 text-center font-body-md text-body-md text-secondary">
            Already have an account?{' '}
            <Link className="font-bold text-primary hover:underline" to="/login" state={location.state}>
              Log in
            </Link>
          </p>

          {/* Terms */}
          <p className="px-8 text-center font-label-md text-[11px] leading-relaxed text-outline-variant">
            By continuing, you agree to Codexa&apos;s{' '}
            <a className="underline" href="#">
              Terms of Service
            </a>{' '}
            and{' '}
            <a className="underline" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
