'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, LoaderCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Username + password sign-in for the shared login. Posts to /api/auth/login,
// which sets the signed session cookie; we then refresh so the proxy re-runs
// with the session and lets us into the app.
export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })

    if (!res.ok) {
      setError('用戶名或密碼唔啱,請再試。')
      setIsSubmitting(false)
      return
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm text-muted-foreground">
          用戶名
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm text-muted-foreground">
          密碼
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!username.trim() || !password || isSubmitting}
        className="h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2 mt-2"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="w-4 h-4 animate-spin" />
            登入緊…
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            登入
          </>
        )}
      </Button>
    </form>
  )
}
