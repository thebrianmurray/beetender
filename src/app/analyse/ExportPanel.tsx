'use client'

import { useState } from 'react'
import { Survey } from '@/types/survey'
import { isoToDisplay } from '@/lib/survey-utils'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

const COLUMNS: { key: keyof Survey; label: string }[] = [
  { key: 'site_id', label: 'Site ID' },
  { key: 'surveyor_initials', label: 'Surveyor' },
  { key: 'date', label: 'Date' },
  { key: 'month', label: 'Month' },
  { key: 'survey_method', label: 'Survey Method' },
  { key: 'station_transect_section', label: 'Station/Section' },
  { key: 'bowl_colour', label: 'Bowl Colour' },
  { key: 'pollinator_group', label: 'Pollinator Group' },
  { key: 'caste', label: 'Caste' },
  { key: 'genus', label: 'Genus' },
  { key: 'species', label: 'Species' },
  { key: 'modifier', label: 'Modifier' },
  { key: 'species_name', label: 'Species Name' },
  { key: 'id_code', label: 'ID Code' },
  { key: 'determiner', label: 'Determiner' },
  { key: 'comments', label: 'Comments' },
]

function toRows(surveys: Survey[]) {
  return surveys.map((s) =>
    COLUMNS.reduce((row, col) => {
      let val: string = (s[col.key] as string) ?? ''
      if (col.key === 'date') val = isoToDisplay(val)
      row[col.label] = val
      return row
    }, {} as Record<string, string>)
  )
}

export function ExportPanel({ surveys }: { surveys: Survey[] }) {
  const [exporting, setExporting] = useState<string | null>(null)

  function exportCSV() {
    setExporting('csv')
    const rows = toRows(surveys)
    const headers = COLUMNS.map((c) => c.label)
    const lines = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((h) => `"${(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bee-tender-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
    toast.success('CSV exported')
  }

  function exportExcel() {
    setExporting('excel')
    const rows = toRows(surveys)
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Surveys')
    // Auto-fit columns
    const colWidths = COLUMNS.map((c) => ({
      wch: Math.max(
        c.label.length,
        ...rows.map((r) => (r[c.label] ?? '').length)
      ) + 2,
    }))
    ws['!cols'] = colWidths
    XLSX.writeFile(wb, `bee-tender-${new Date().toISOString().slice(0, 10)}.xlsx`)
    setExporting(null)
    toast.success('Excel file exported')
  }

  async function exportWord() {
    setExporting('word')
    try {
      const res = await fetch('/api/export/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveys }),
      })
      if (!res.ok) throw new Error('Server error')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bee-tender-report-${new Date().toISOString().slice(0, 10)}.docx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Word report exported')
    } catch {
      toast.error('Word export failed')
    } finally {
      setExporting(null)
    }
  }

  async function exportPDF() {
    setExporting('pdf')
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveys }),
      })
      if (!res.ok) throw new Error('Server error')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bee-tender-report-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF report exported')
    } catch {
      toast.error('PDF export failed')
    } finally {
      setExporting(null)
    }
  }

  const EXPORTS = [
    {
      key: 'csv',
      label: 'CSV',
      description: 'Plain comma-separated values. Opens in any spreadsheet app.',
      icon: FileSpreadsheet,
      colour: 'border-green-200 bg-green-50',
      action: exportCSV,
    },
    {
      key: 'excel',
      label: 'Excel',
      description: 'Formatted .xlsx workbook with auto-fitted columns.',
      icon: FileSpreadsheet,
      colour: 'border-emerald-200 bg-emerald-50',
      action: exportExcel,
    },
    {
      key: 'word',
      label: 'Word Report',
      description: 'Formatted .docx report with survey summary table.',
      icon: FileText,
      colour: 'border-blue-200 bg-blue-50',
      action: exportWord,
    },
    {
      key: 'pdf',
      label: 'PDF Report',
      description: 'Printable PDF report with survey summary table.',
      icon: FileText,
      colour: 'border-violet-200 bg-violet-50',
      action: exportPDF,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 text-sm text-amber-800">
        <strong>{surveys.length}</strong> records will be included in all exports.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXPORTS.map(({ key, label, description, icon: Icon, colour, action }) => (
          <div
            key={key}
            className={`rounded-2xl border ${colour} p-5 flex flex-col gap-3`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </div>
            <Button
              onClick={action}
              disabled={!!exporting}
              variant="outline"
              className="w-full"
            >
              {exporting === key ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export {label}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
