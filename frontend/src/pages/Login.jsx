import { Link, useNavigate } from 'react-router-dom'
import AuthSidePanel from '../components/AuthSidePanel.jsx'
import { GoogleIcon, GithubIcon } from '../components/icons.jsx'

export default function Login() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen overflow-hidden bg-surface">
      <AuthSidePanel />

      {/* Right Section: Login Form */}
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
              Welcome to Codexa
            </h1>
            <p className="font-body-md text-body-md text-secondary">
              Continue your engineering journey today.
            </p>
          </div>

          {/* Social Sign In */}
          <div className="space-y-stack-sm">
            <button className="group flex h-12 w-full items-center justify-center gap-stack-sm rounded-xl border border-outline-variant bg-surface transition-all hover:scale-[1.01] hover:bg-surface-container-low active:scale-[0.98]">
              <GoogleIcon />
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Sign in with Google
              </span>
            </button>
            <button className="group flex h-12 w-full items-center justify-center gap-stack-sm rounded-xl border border-outline-variant bg-surface transition-all hover:scale-[1.01] hover:bg-surface-container-low active:scale-[0.98]">
              <GithubIcon />
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Sign in with GitHub
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

          {/* Traditional Form */}
          <form
            className="space-y-stack-md"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/dashboard')
            }}
          >
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
                placeholder="name@company.com"
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-body-md outline-none transition-all placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label
                  className="font-label-md text-label-md text-secondary"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="font-label-md text-label-md text-primary transition-all hover:underline"
                  href="#"
                >
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-body-md outline-none transition-all placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="mt-2 h-12 w-full rounded-xl bg-primary-container font-label-md text-label-md font-bold text-white shadow-md transition-all hover:bg-primary active:scale-[0.99]"
            >
              Log In to Dashboard
            </button>
          </form>

          {/* Footer Link */}
          <p className="pt-2 text-center font-body-md text-body-md text-secondary">
            Don&apos;t have an account?{' '}
            <Link
              className="font-bold text-primary hover:underline"
              to="/signup"
            >
              Create an account
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
