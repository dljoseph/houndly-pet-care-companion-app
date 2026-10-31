import { useState, type FormEvent } from 'react';
import { Dog, Mail, Lock, Loader2 } from 'lucide-react';
import { describeAuthError, signInWithEmail, signUpWithEmail } from '@/lib/auth';

type AuthMode = 'login' | 'signup';

const INPUT_CLASS =
  'tap-target w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-3 text-base text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const isSignup = mode === 'signup';

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setNoticeMessage(null);
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setNoticeMessage(null);
    try {
      if (isSignup) {
        const hasSession = await signUpWithEmail(email.trim(), password);
        if (!hasSession) {
          setNoticeMessage('Your account is ready. Log in with your email and password to continue.');
          setMode('login');
        }
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error) {
      setErrorMessage(describeAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-cream-50 shadow-soft">
            <Dog className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-3xl font-bold text-brand-800">Houndly</h1>
          <p className="mt-2 text-base text-ink-muted">Your dog's care, organised in minutes.</p>
        </div>

        <div className="rounded-3xl border border-cream-300 bg-white p-6 shadow-soft sm:p-8">
          <div role="tablist" aria-label="Account" className="mb-6 grid grid-cols-2 rounded-full bg-cream-200 p-1">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                disabled={isSubmitting}
                onClick={() => switchMode(tab)}
                className={`tap-target rounded-full text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60 ${
                  mode === tab ? 'bg-white text-brand-800 shadow-soft' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {noticeMessage && (
            <p role="status" className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
              {noticeMessage}
            </p>
          )}

          {errorMessage && (
            <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-email" className="text-sm font-semibold text-ink">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-password" className="text-sm font-semibold text-ink">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={isSignup ? 8 : undefined}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  disabled={isSubmitting}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="tap-target mt-2 flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-base font-semibold text-cream-50 shadow-soft transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
