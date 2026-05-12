import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { ExportPanel } from './ExportPanel'
import Link from 'next/link'
import { BarChart3, ArrowRight } from 'lucide-react'

export default async function AnalysePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .order('date', { ascending: false })

  const total = surveys?.length ?? 0
  const uniqueSpecies = new Set(surveys?.map(s => s.species_name).filter(Boolean)).size

  return (
    <AppShell userEmail={user?.email}>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analyse Data</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {total} records · {uniqueSpecies} species
          </p>
        </div>

        {/* Overview card */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Overview</h2>
          <Link
            href="/analyse/overview"
            className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 flex items-center justify-between hover:border-gray-400 dark:hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-3">
                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Charts &amp; Species List</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                  Group breakdown, monthly trends, {uniqueSpecies} species recorded
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors shrink-0 ml-4" />
          </Link>
        </section>

        {/* Export panel */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Export</h2>
          <ExportPanel surveys={surveys ?? []} />
        </section>
      </div>
    </AppShell>
  )
}
