import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { ExportPanel } from './ExportPanel'
import { OverviewPanel } from './OverviewPanel'

export default async function AnalysePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .order('date', { ascending: false })

  return (
    <AppShell userEmail={user?.email}>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analyse Data</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Overview and exports — {surveys?.length ?? 0} records
          </p>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">Overview</h2>
          <OverviewPanel surveys={surveys ?? []} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">Export</h2>
          <ExportPanel surveys={surveys ?? []} />
        </section>
      </div>
    </AppShell>
  )
}
