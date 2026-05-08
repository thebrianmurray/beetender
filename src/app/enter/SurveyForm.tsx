'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { deriveBowlColour, deriveMonth, deriveSpeciesName, displayToIso } from '@/lib/survey-utils'
import { SurveyMethod, PollinatorGroup, Caste, Modifier, BowlColour } from '@/types/survey'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const EMPTY_FORM = {
  site_id: '',
  surveyor_initials: '',
  date: '',
  survey_method: '' as SurveyMethod | '',
  station_transect_section: '',
  pollinator_group: '' as PollinatorGroup | '',
  caste: '' as Caste | '',
  genus: '',
  species: '',
  modifier: '' as Modifier | '',
  id_code: '',
  determiner: 'Brian Murray',
  comments: '',
}

function FormField({ label, required, children, hint }: {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export function SurveyForm({ initialData }: { initialData?: typeof EMPTY_FORM & { id?: string; image_url?: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null)
  const [saving, setSaving] = useState(false)

  // Derived fields
  const month = deriveMonth(form.date)
  const bowlColour = deriveBowlColour(form.station_transect_section, form.survey_method as SurveyMethod)
  const speciesName = deriveSpeciesName(form.genus, form.species, form.modifier as Modifier)

  function set(field: keyof typeof EMPTY_FORM, value: string | null) {
    setForm((prev) => ({ ...prev, [field]: value ?? '' }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.site_id || !form.date || !form.survey_method || !form.pollinator_group) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    const supabase = createClient()

    let image_url: string | null = initialData?.image_url ?? null

    // Upload image if selected
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('survey-images')
        .upload(fileName, imageFile, { upsert: false })

      if (uploadError) {
        toast.error('Image upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('survey-images').getPublicUrl(uploadData.path)
      image_url = urlData.publicUrl
    }

    const isoDate = form.date.includes('/') ? displayToIso(form.date) : form.date

    const payload = {
      site_id: form.site_id,
      surveyor_initials: form.surveyor_initials,
      date: isoDate,
      month,
      survey_method: form.survey_method as SurveyMethod,
      station_transect_section: form.station_transect_section,
      bowl_colour: bowlColour as BowlColour,
      pollinator_group: form.pollinator_group as PollinatorGroup,
      caste: (form.caste || '') as Caste,
      genus: form.genus,
      species: form.species,
      modifier: (form.modifier || '') as Modifier,
      species_name: speciesName,
      id_code: form.id_code,
      determiner: form.determiner,
      comments: form.comments,
      image_url,
    }

    let error
    if (initialData?.id) {
      ;({ error } = await supabase.from('surveys').update(payload).eq('id', initialData.id))
    } else {
      ;({ error } = await supabase.from('surveys').insert(payload))
    }

    setSaving(false)

    if (error) {
      toast.error('Save failed: ' + error.message)
      return
    }

    toast.success(initialData?.id ? 'Record updated' : 'Observation saved')
    if (!initialData?.id) {
      setForm({ ...EMPTY_FORM })
      setImageFile(null)
      setImagePreview(null)
    } else {
      router.push('/view')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Section: Site */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">Site & Survey</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Site ID" required>
            <Input
              value={form.site_id}
              onChange={(e) => set('site_id', e.target.value)}
              placeholder="e.g. SITE01"
              className="uppercase"
            />
          </FormField>
          <FormField label="Surveyor Initials" required>
            <Input
              value={form.surveyor_initials}
              onChange={(e) => set('surveyor_initials', e.target.value.toUpperCase())}
              placeholder="e.g. BM"
              maxLength={5}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date" required hint="dd/mm/yyyy">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </FormField>
          <FormField label="Month">
            <div className="flex items-center h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
              {month || <span className="text-gray-300">Auto-filled</span>}
            </div>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Survey Method" required>
            <Select value={form.survey_method} onValueChange={(v) => set('survey_method', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pan Trap">Pan Trap</SelectItem>
                <SelectItem value="Transect">Transect</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Station / Transect Section"
            hint={form.survey_method === 'Pan Trap' ? 'Last letter: y=Yellow, w=White, b=Blue' : undefined}
          >
            <Input
              value={form.station_transect_section}
              onChange={(e) => set('station_transect_section', e.target.value)}
              placeholder="e.g. A1y"
            />
          </FormField>
        </div>
        {form.survey_method === 'Pan Trap' && (
          <FormField label="Bowl Colour">
            <div className="flex items-center h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm">
              {bowlColour ? (
                <Badge
                  className={
                    bowlColour === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                    bowlColour === 'White' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-800'
                  }
                >
                  {bowlColour}
                </Badge>
              ) : (
                <span className="text-gray-300">Derived from station</span>
              )}
            </div>
          </FormField>
        )}
      </div>

      {/* Section: Organism */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">Organism</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Pollinator Group" required>
            <Select value={form.pollinator_group} onValueChange={(v) => set('pollinator_group', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hoverfly">Hoverfly</SelectItem>
                <SelectItem value="Bumblebee">Bumblebee</SelectItem>
                <SelectItem value="Solitary Bee">Solitary Bee</SelectItem>
                <SelectItem value="Butterfly">Butterfly</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Caste">
            <Select value={form.caste} onValueChange={(v) => set('caste', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                <SelectItem value="Worker">Worker</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Queen">Queen</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Genus">
            <Input
              value={form.genus}
              onChange={(e) => set('genus', e.target.value)}
              placeholder="e.g. Bombus"
            />
          </FormField>
          <FormField label="Species">
            <Input
              value={form.species}
              onChange={(e) => set('species', e.target.value)}
              placeholder="e.g. terrestris"
            />
          </FormField>
        </div>
        <FormField label="Modifier">
          <Select value={form.modifier} onValueChange={(v) => set('modifier', v)}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              <SelectItem value="sensu lato (s.l.)">sensu lato (s.l.)</SelectItem>
              <SelectItem value="sensu stricto (s. str.)">sensu stricto (s. str.)</SelectItem>
              <SelectItem value="confer (cf.)">confer (cf.)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Species Name">
          <div className="flex items-center h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm italic text-gray-600">
            {speciesName || <span className="not-italic text-gray-300">Derived from Genus + Species</span>}
          </div>
        </FormField>
      </div>

      {/* Section: Record */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">Record Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="ID Code">
            <Input
              value={form.id_code}
              onChange={(e) => set('id_code', e.target.value)}
              placeholder="e.g. BM001"
            />
          </FormField>
          <FormField label="Determiner">
            <Input
              value={form.determiner}
              onChange={(e) => set('determiner', e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Comments">
          <Textarea
            value={form.comments}
            onChange={(e) => set('comments', e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
          />
        </FormField>
      </div>

      {/* Section: Image */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">Photo (optional)</h3>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Specimen"
              className="w-full max-h-64 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment')
                  fileInputRef.current.click()
                }
              }}
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture')
                  fileInputRef.current.click()
                }
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-5 rounded-xl"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
        ) : (
          initialData?.id ? 'Update Record' : 'Save Observation'
        )}
      </Button>
    </form>
  )
}
