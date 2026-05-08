import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { SettingsPanel } from './SettingsPanel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin = user?.email === 'i0041974@gmail.com'

  return (
    <AppShell userEmail={user?.email}>
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage defaults and preferences</p>
        </div>
        <SettingsPanel isAdmin={isAdmin} userEmail={user?.email ?? ''} />
      </div>
    </AppShell>
  )
}
