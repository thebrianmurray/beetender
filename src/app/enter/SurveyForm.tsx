'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { deriveBowlColour, deriveMonth, deriveSpeciesName, displayToIso } from '@/lib/survey-utils'
import { SurveyMethod, PollinatorGroup, Caste, Modifier, BowlColour, Sex } from '@/types/survey'
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
import { Camera, Upload, X, Loader2, CopyPlus } from 'lucide-react'

const EMPTY_FORM = {
  site_id: '',
  surveyor_initials: '',
  date: '',
  survey_method: '' as SurveyMethod | '',
  station_transect_section: '',
  pollinator_group: '' as PollinatorGroup | '',
  caste: '' as Caste | '',
  sex: '' as Sex | '',
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
      <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-gray-400 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-zinc-500">{hint}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">{title}</h3>
      {children}
    </div>
  )
}

function DerivedField({ value, placeholder }: { value: string; placeholder: string }) {
  return (
    <div className="flex items-center h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-600 dark:text-zinc-300">
      {value || <span className="text-gray-300 dark:text-zinc-600">{placeholder}</span>}
    </div>
  )
}

export function SurveyForm({ initialData }: { initialData?: typeof EMPTY_FORM & { id?: string; image_url?: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null)
  const [saving, setSaving] = useState<null | 'save' | 'duplicate'>(null)
  const organismRef = useRef<HTMLDivElement>(null)

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

  // Fields that belong to the site/survey section — kept when duplicating
  const SITE_FIELDS = ['site_id', 'surveyor_initials', 'date', 'survey_method', 'station_transect_section'] as const

  async function save(mode: 'save' | 'duplicate') {
    if (!form.site_id || !form.date || !form.survey_method || !form.pollinator_group) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(mode)
    const supabase = createClient()

    let image_url: string | null = initialData?.image_url ?? null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('survey-images')
        .upload(fileName, imageFile, { upsert: false })

      if (uploadError) {
        toast.error('Image upload failed: ' + uploadError.message)
        setSaving(null)
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
      sex: (form.sex || '') as Sex,
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

    setSaving(null)

    if (error) {
      toast.error('Save failed: ' + error.message)
      return
    }

    if (initialData?.id) {
      toast.success('Record updated')
      router.push('/view')
      return
    }

    if (mode === 'save') {
      toast.success('Observation saved')
      setForm({ ...EMPTY_FORM })
      setImageFile(null)
      setImagePreview(null)
    } else {
      // Duplicate: keep site fields, clear organism fields
      toast.success('Saved — site details kept for next record')
      setForm((prev) => ({
        ...EMPTY_FORM,
        ...Object.fromEntries(SITE_FIELDS.map((k) => [k, prev[k]])),
      }))
      setImageFile(null)
      setImagePreview(null)
      // Scroll to organism section
      setTimeout(() => organismRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    save('save')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Section title="Site & Survey">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Site ID" required>
            <Input
              value={form.site_id}
              onChange={(e) => set('site_id', e.target.value)}
              placeholder="e.g. SITE01"
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
          <FormField label="Date" required>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </FormField>
          <FormField label="Month">
            <DerivedField value={month} placeholder="Auto-filled" />
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
            <DerivedField value={bowlColour} placeholder="Derived from station" />
          </FormField>
        )}
      </Section>

      <div ref={organismRef}>
      <Section title="Organism">
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
          <FormField label="Sex">
            <Select value={form.sex} onValueChange={(v) => set('sex', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <div />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Genus">
            <Input value={form.genus} onChange={(e) => set('genus', e.target.value)} placeholder="e.g. Bombus" />
          </FormField>
          <FormField label="Species">
            <Input value={form.species} onChange={(e) => set('species', e.target.value)} placeholder="e.g. terrestris" />
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
          <div className="flex items-center h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm italic text-gray-700 dark:text-zinc-300">
            {speciesName || <span className="not-italic text-gray-300 dark:text-zinc-600">Derived from Genus + Species</span>}
          </div>
        </FormField>
      </Section>
      </div>

      <Section title="Record Details">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="ID Code">
            <Input value={form.id_code} onChange={(e) => set('id_code', e.target.value)} placeholder="e.g. BM001" />
          </FormField>
          <FormField label="Determiner">
            <Input value={form.determiner} onChange={(e) => set('determiner', e.target.value)} />
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
      </Section>

      <Section title="Photo (optional)">
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Specimen" className="w-full max-h-64 object-cover rounded-xl" />
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
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </Section>

      {initialData?.id ? (
        // Edit mode — single update button
        <Button
          type="submit"
          disabled={!!saving}
          className="w-full bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-semibold py-5 rounded-xl"
        >
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Update Record'}
        </Button>
      ) : (
        // New record — save or save + duplicate
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!!saving}
            className="flex-1 bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-semibold py-5 rounded-xl"
          >
            {saving === 'save' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Observation'}
          </Button>
          <Button
            type="button"
            disabled={!!saving}
            onClick={() => save('duplicate')}
            variant="outline"
            className="flex-1 font-semibold py-5 rounded-xl border-gray-300 dark:border-zinc-700"
          >
            {saving === 'duplicate'
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              : <><CopyPlus className="w-4 h-4 mr-2" /> Save + New Duplicate</>}
          </Button>
        </div>
      )}
    </form>
  )
}
