'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (!error) setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🐝</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Bee Tender</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 text-center">Pollinator survey data management</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-2 w-full text-center">
            Authentication failed. Please try again.
          </p>
        )}

        {sent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-9 h-9 text-gray-900 dark:text-gray-100" />
            <p className="font-medium text-gray-900 dark:text-gray-100">Check your email</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              We sent a sign-in link to <strong>{email}</strong>. Click it to access Bee Tender.
            </p>
            <button
              className="text-xs text-gray-400 underline underline-offset-2 mt-1"
              onClick={() => { setSent(false); setEmail('') }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-medium py-5 rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Send sign-in link
            </Button>
          </form>
        )}

        <p className="text-xs text-gray-400 dark:text-zinc-600 text-center">
          Access restricted to authorised surveyors
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
