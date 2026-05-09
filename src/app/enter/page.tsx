import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { SurveyForm } from './SurveyForm'

export default async function EnterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <AppShell userEmail={user?.email}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Enter Data</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Record a new pollinator observation</p>
        </div>
        <SurveyForm />
      </div>
    </AppShell>
  )
}
