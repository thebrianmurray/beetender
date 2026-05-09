// Bee Tender v1.0
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import { ClipboardPen, Table2, BarChart3, Settings2, ArrowRight } from 'lucide-react'

const MODULES = [
  {
    href: '/enter',
    icon: ClipboardPen,
    label: 'Enter Data',
    description: 'Record a new pollinator observation with full field data and optional photo.',
  },
  {
    href: '/view',
    icon: Table2,
    label: 'View Data',
    description: 'Browse, search, edit and update all survey records. Add images to existing entries.',
  },
  {
    href: '/analyse',
    icon: BarChart3,
    label: 'Analyse Data',
    description: 'Export to CSV or Excel. Generate Word and PDF reports from your survey data.',
  },
  {
    href: '/settings',
    icon: Settings2,
    label: 'Settings',
    description: 'Manage default values, dropdown options, site IDs and surveyor profiles.',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count } = await supabase
    .from('surveys')
    .select('*', { count: 'exact', head: true })

  return (
    <AppShell userEmail={user?.email}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-500 dark:text-zinc-400">
            {count !== null && count !== undefined
              ? `${count.toLocaleString()} observation${count !== 1 ? 's' : ''} recorded`
              : 'Pollinator survey data management'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODULES.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-all duration-200 hover:border-gray-400 dark:hover:border-zinc-600 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-gray-100 dark:bg-zinc-800 p-2.5 text-gray-700 dark:text-gray-300">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">{label}</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
