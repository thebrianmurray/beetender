'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Survey } from '@/types/survey'
import { createClient } from '@/lib/supabase/client'
import { isoToDisplay } from '@/lib/survey-utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Pencil, Trash2, ImageIcon, Plus } from 'lucide-react'
import Link from 'next/link'

const POLLINATOR_COLOURS: Record<string, string> = {
  Hoverfly: 'bg-orange-100 text-orange-800',
  Bumblebee: 'bg-yellow-100 text-yellow-800',
  'Solitary Bee': 'bg-amber-100 text-amber-800',
  Butterfly: 'bg-pink-100 text-pink-800',
}

export function SurveyTable({ surveys: initialSurveys }: { surveys: Survey[] }) {
  const router = useRouter()
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
      {/* Toolbar */}
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
          <Button className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-1.5" /> Add
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50 text-amber-900 text-xs font-semibold uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Site</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Group</th>
                <th className="px-4 py-3 text-left">Species</th>
                <th className="px-4 py-3 text-left">ID Code</th>
                <th className="px-4 py-3 text-left">Surveyor</th>
                <th className="px-4 py-3 text-left w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    {search ? 'No records match your search' : 'No observations recorded yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((survey, idx) => (
                  <tr
                    key={survey.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {isoToDisplay(survey.date)}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-800">{survey.site_id}</td>
                    <td className="px-4 py-3 text-gray-600">{survey.survey_method}</td>
                    <td className="px-4 py-3">
                      <Badge className={POLLINATOR_COLOURS[survey.pollinator_group] ?? ''}>
                        {survey.pollinator_group}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 italic text-gray-700">
                      {survey.species_name || `${survey.genus} ${survey.species}`.trim() || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">{survey.id_code || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{survey.surveyor_initials}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {survey.image_url && (
                          <button
                            onClick={() => setImageDialog(survey)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            title="View image"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Link href={`/view/${survey.id}/edit`}>
                          <button
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteId(survey.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
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

      {/* Image dialog */}
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
          <p className="text-sm text-gray-500">
            {isoToDisplay(imageDialog?.date ?? '')} · {imageDialog?.site_id} · {imageDialog?.surveyor_initials}
          </p>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This cannot be undone.</p>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
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
