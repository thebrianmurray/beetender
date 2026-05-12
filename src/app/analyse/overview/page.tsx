import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { OverviewPanel } from '../OverviewPanel'

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .order('date', { ascending: false })

  return (
    <AppShell userEmail={user?.email}>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Overview</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {surveys?.length ?? 0} records across {new Set(surveys?.map(s => s.species_name).filter(Boolean)).size} species
          </p>
        </div>
        <OverviewPanel surveys={surveys ?? []} />
      </div>
    </AppShell>
  )
}
