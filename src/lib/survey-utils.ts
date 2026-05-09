import { BowlColour, Modifier, SurveyMethod } from '@/types/survey'
import { format, parse } from 'date-fns'

export function deriveBowlColour(station: string, method: SurveyMethod): BowlColour {
  if (method === 'Transect') return ''
  const last = station.trim().slice(-1).toLowerCase()
  if (last === 'y') return 'Yellow'
  if (last === 'w') return 'White'
  if (last === 'b') return 'Blue'
  return ''
}

export function deriveMonth(dateStr: string): string {
  if (!dateStr) return ''
  try {
    // date input returns ISO format yyyy-MM-dd
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
    return format(parsed, 'MMMM')
  } catch {
    return ''
  }
}

export function deriveSpeciesName(genus: string, species: string, modifier: Modifier): string {
  const parts = [genus.trim(), species.trim()].filter(Boolean)
  if (parts.length === 0) return ''

  const base = parts.join(' ')

  if (!modifier) return base

  if (modifier === 'confer (cf.)') {
    // cf. goes between genus and species: "Genus cf. species"
    if (genus && species) return `${genus.trim()} cf. ${species.trim()}`
    return base
  }

  if (modifier === 'sensu lato (s.l.)') return `${base} s.l.`
  if (modifier === 'sensu stricto (s. str.)') return `${base} s. str.`

  return base
}

export function isoToDisplay(isoDate: string): string {
  if (!isoDate) return ''
  try {
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
  } catch {
    return isoDate
  }
}

export function displayToIso(displayDate: string): string {
  if (!displayDate) return ''
  try {
    const [day, month, year] = displayDate.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  } catch {
    return displayDate
  }
}
