import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { ExportPanel } from './ExportPanel'

export default async function AnalysePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .order('date', { ascending: false })

  return (
    <AppShell userEmail={user?.email}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Analyse Data</h1>
          <p className="text-sm text-gray-500 mt-1">
            Export your data or generate reports
          </p>
        </div>
        <ExportPanel surveys={surveys ?? []} />
      </div>
    </AppShell>
  )
}
