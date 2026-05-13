'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Survey } from '@/types/survey'
import { createClient } from '@/lib/supabase/client'
import { isoToDisplay } from '@/lib/survey-utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Pencil, Trash2, ImageIcon, Plus } from 'lucide-react'

export function SurveyTable({ surveys: initialSurveys }: { surveys: Survey[] }) {
  const [surveys, setSurveys] = useState(initialSurveys)
  const [search, setSearch] = useState('')
  const [imageDialog, setImageDialog] = useState<Survey | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = surveys.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.site_id?.toLowerCase().includes(q) ||
      s.species_name?.toLowerCase().includes(q) ||
      s.genus?.toLowerCase().includes(q) ||
      s.species?.toLowerCase().includes(q) ||
      s.surveyor_initials?.toLowerCase().includes(q) ||
      s.pollinator_group?.toLowerCase().includes(q) ||
      s.id_code?.toLowerCase().includes(q)
    )
  })

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('surveys').delete().eq('id', id)
    if (error) {
      toast.error('Delete failed: ' + error.message)
      return
    }
    setSurveys((prev) => prev.filter((s) => s.id !== id))
    setDeleteId(null)
    toast.success('Record deleted')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search site, species, surveyor..."
            className="pl-9"
          />
        </div>
        <Link href="/enter">
          <Button className="bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white">
            <Plus className="w-4 h-4 mr-1.5" /> Add
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500 w-16">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Site</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Group</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Species</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">ID Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Surveyor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 dark:text-zinc-500">
                    {search ? 'No records match your search' : 'No observations recorded yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((survey) => (
                  <tr
                    key={survey.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold tabular-nums">
                        {survey.label_number}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-zinc-400 text-xs">
                      {isoToDisplay(survey.date)}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200 text-xs">{survey.site_id}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 text-xs">{survey.survey_method}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                        {survey.pollinator_group}
                      </span>
                    </td>
                    <td className="px-4 py-3 italic text-gray-800 dark:text-gray-200 text-xs">
                      {survey.species_name || `${survey.genus} ${survey.species}`.trim() || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-zinc-400 text-xs">{survey.id_code || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 text-xs">{survey.surveyor_initials}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {survey.image_url && (
                          <button
                            onClick={() => setImageDialog(survey)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            title="View image"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Link href={`/view/${survey.id}/edit`}>
                          <button
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteId(survey.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!imageDialog} onOpenChange={() => setImageDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="italic">{imageDialog?.species_name}</DialogTitle>
          </DialogHeader>
          {imageDialog?.image_url && (
            <img
              src={imageDialog.image_url}
              alt={imageDialog.species_name}
              className="w-full rounded-xl object-contain max-h-[60vh]"
            />
          )}
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {isoToDisplay(imageDialog?.date ?? '')} · {imageDialog?.site_id} · {imageDialog?.surveyor_initials}
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-zinc-400">This cannot be undone.</p>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              className="bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
