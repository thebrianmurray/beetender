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
    colour: 'from-amber-400 to-yellow-300',
    bg: 'bg-amber-50 hover:bg-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-900',
  },
  {
    href: '/view',
    icon: Table2,
    label: 'View Data',
    description: 'Browse, search, edit and update all survey records. Add images to existing entries.',
    colour: 'from-green-400 to-emerald-300',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
  },
  {
    href: '/analyse',
    icon: BarChart3,
    label: 'Analyse Data',
    description: 'Export to CSV or Excel. Generate Word and PDF reports from your survey data.',
    colour: 'from-blue-400 to-cyan-300',
    bg: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-900',
  },
  {
    href: '/settings',
    icon: Settings2,
    label: 'Settings',
    description: 'Manage default values, dropdown options, site IDs and surveyor profiles.',
    colour: 'from-violet-400 to-purple-300',
    bg: 'bg-violet-50 hover:bg-violet-100',
    border: 'border-violet-200',
    text: 'text-violet-900',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Quick stats
  const { count } = await supabase
    .from('surveys')
    .select('*', { count: 'exact', head: true })

  return (
    <AppShell userEmail={user?.email}>
      <div className="flex flex-col gap-8">
        {/* Hero */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-amber-900 tracking-tight">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-500">
            {count !== null && count !== undefined
              ? `${count.toLocaleString()} observation${count !== 1 ? 's' : ''} recorded`
              : 'Pollinator survey data management'}
          </p>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODULES.map(({ href, icon: Icon, label, description, bg, border, text }) => (
            <Link
              key={href}
              href={href}
              className={`group relative flex flex-col gap-3 rounded-2xl border ${border} ${bg} p-6 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-xl p-2.5 ${text} bg-white/60`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className={`w-4 h-4 ${text} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div>
                <h2 className={`font-semibold text-lg ${text}`}>{label}</h2>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
