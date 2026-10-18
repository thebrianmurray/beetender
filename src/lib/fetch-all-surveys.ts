import { SupabaseClient } from '@supabase/supabase-js'
import { Survey } from '@/types/survey'

const PAGE_SIZE = 1000

export async function fetchAllSurveys(supabase: SupabaseClient): Promise<Survey[]> {
  let from = 0
  const all: Survey[] = []

  while (true) {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error || !data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return all
}
