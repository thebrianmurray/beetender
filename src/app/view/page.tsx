import { createClient } from '@/lib/supabase/server'
import { fetchAllSurveys } from '@/lib/fetch-all-surveys'
import { AppShell } from '@/components/layout/AppShell'
import { SurveyTable } from './SurveyTable'

export default async function ViewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const surveys = await fetchAllSurveys(supabase)

  return (
    <AppShell userEmail={user?.email}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">View Data</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {surveys.length} observation{surveys.length !== 1 ? 's' : ''}
          </p>
        </div>
        <SurveyTable surveys={surveys} />
      </div>
    </AppShell>
  )
}
