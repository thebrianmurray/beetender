import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { SettingsPanel } from './SettingsPanel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin = user?.email === 'i0041974@gmail.com'

  const build = {
    sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    message: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? 'development build',
    deployedAt: process.env.VERCEL_GIT_COMMIT_SHA
      ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : null,
  }

  return (
    <AppShell userEmail={user?.email}>
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage defaults and preferences</p>
        </div>
        <SettingsPanel isAdmin={isAdmin} userEmail={user?.email ?? ''} build={build} />
      </div>
    </AppShell>
  )
}
