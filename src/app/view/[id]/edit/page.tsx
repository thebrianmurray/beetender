import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { SurveyForm } from '@/app/enter/SurveyForm'
import { notFound } from 'next/navigation'
import { isoToDisplay } from '@/lib/survey-utils'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !survey) notFound()

  const initialData = {
    id: survey.id,
    site_id: survey.site_id ?? '',
    surveyor_initials: survey.surveyor_initials ?? '',
    date: survey.date ?? '',
    survey_method: survey.survey_method ?? '',
    station_transect_section: survey.station_transect_section ?? '',
    pollinator_group: survey.pollinator_group ?? '',
    caste: survey.caste ?? '',
    genus: survey.genus ?? '',
    species: survey.species ?? '',
    modifier: survey.modifier ?? '',
    id_code: survey.id_code ?? '',
    determiner: survey.determiner ?? 'Brian Murray',
    comments: survey.comments ?? '',
    image_url: survey.image_url ?? undefined,
  }

  return (
    <AppShell userEmail={user?.email}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-amber-900">Edit Record</h1>
          <p className="text-sm text-gray-500 mt-1 italic">{survey.species_name || survey.site_id}</p>
        </div>
        <SurveyForm initialData={initialData as any} />
      </div>
    </AppShell>
  )
}
