'use client'

import { Survey } from '@/types/survey'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

const GROUP_COLOURS: Record<string, string> = {
  'Hoverfly':     '#525252',
  'Bumblebee':    '#a3a3a3',
  'Solitary Bee': '#d4d4d4',
  'Butterfly':    '#e5e5e5',
}

const MONTH_ORDER = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const GROUPS = ['Hoverfly', 'Bumblebee', 'Solitary Bee', 'Butterfly']

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-3">
      {children}
    </h3>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 ${className}`}>
      {children}
    </div>
  )
}

export function OverviewPanel({ surveys }: { surveys: Survey[] }) {
  if (surveys.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-8">
          No data yet — add some observations first.
        </p>
      </Card>
    )
  }

  // --- Pollinator group counts for pie chart ---
  const groupCounts = GROUPS.map((g) => ({
    name: g,
    value: surveys.filter((s) => s.pollinator_group === g).length,
  })).filter((d) => d.value > 0)

  // --- Unique species with counts ---
  const speciesMap: Record<string, number> = {}
  for (const s of surveys) {
    const name = s.species_name?.trim() || [s.genus, s.species].filter(Boolean).join(' ') || '(unidentified)'
    speciesMap[name] = (speciesMap[name] ?? 0) + 1
  }
  const speciesList = Object.entries(speciesMap)
    .sort((a, b) => b[1] - a[1])

  // --- Monthly breakdown by pollinator group ---
  const monthlyMap: Record<string, Record<string, number>> = {}
  for (const s of surveys) {
    const m = s.month || 'Unknown'
    if (!monthlyMap[m]) monthlyMap[m] = {}
    monthlyMap[m][s.pollinator_group] = (monthlyMap[m][s.pollinator_group] ?? 0) + 1
  }
  const monthlyData = MONTH_ORDER
    .filter((m) => monthlyMap[m])
    .map((m) => ({ month: m.slice(0, 3), ...monthlyMap[m] }))

  const total = surveys.length

  return (
    <div className="flex flex-col gap-4">

      {/* Pie chart — group breakdown */}
      <Card>
        <SectionTitle>Pollinator Group Breakdown</SectionTitle>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={groupCounts}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {groupCounts.map((entry) => (
                  <Cell key={entry.name} fill={GROUP_COLOURS[entry.name] ?? '#888'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value, name) => [
                  `${value} (${Math.round(((value as number) / total) * 100)}%)`, name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 min-w-36">
            {groupCounts.map((g) => (
              <div key={g.name} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: GROUP_COLOURS[g.name] }}
                />
                <span className="text-gray-600 dark:text-zinc-400 flex-1">{g.name}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{g.value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-2 mt-1 flex justify-between text-xs text-gray-400">
              <span>Total</span>
              <span className="font-semibold text-gray-700 dark:text-zinc-300">{total}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bar chart — groups per month */}
      {monthlyData.length > 0 && (
        <Card>
          <SectionTitle>Records by Month</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={12} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-zinc-800" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-gray-400 dark:text-zinc-500"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-gray-400 dark:text-zinc-500"
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              />
              {GROUPS.filter((g) => monthlyData.some((d) => d[g as keyof typeof d])).map((g) => (
                <Bar key={g} dataKey={g} stackId="a" fill={GROUP_COLOURS[g]} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Species list */}
      <Card>
        <SectionTitle>Species Recorded ({speciesList.length} unique)</SectionTitle>
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
          {speciesList.map(([name, count]) => (
            <div key={name} className="flex items-center justify-between py-2">
              <span className="text-sm italic text-gray-800 dark:text-gray-200">{name}</span>
              <span className="text-sm font-semibold tabular-nums text-gray-500 dark:text-zinc-400 ml-4 shrink-0">
                {count}
              </span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
