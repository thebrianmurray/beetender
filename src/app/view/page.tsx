import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { SurveyTable } from './SurveyTable'

export default async function ViewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <AppShell userEmail={user?.email}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">View Data</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {surveys?.length ?? 0} observation{surveys?.length !== 1 ? 's' : ''}
          </p>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl p-4">
            Failed to load surveys: {error.message}
          </div>
        )}
        <SurveyTable surveys={surveys ?? []} />
      </div>
    </AppShell>
  )
}
