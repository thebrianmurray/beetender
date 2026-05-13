export type SurveyMethod = 'Pan Trap' | 'Transect'
export type BowlColour = 'Yellow' | 'White' | 'Blue' | ''
export type PollinatorGroup = 'Hoverfly' | 'Bumblebee' | 'Solitary Bee' | 'Butterfly'
export type Caste = 'Not Applicable' | 'Worker' | 'Male' | 'Queen' | ''
export type Modifier = 'sensu lato (s.l.)' | 'sensu stricto (s. str.)' | 'confer (cf.)' | ''
export type Sex = 'Male' | 'Female' | 'Unknown' | ''

export interface Survey {
  id: string
  label_number: number
  site_id: string
  surveyor_initials: string
  date: string // ISO date string yyyy-mm-dd
  month: string // derived
  survey_method: SurveyMethod
  station_transect_section: string
  bowl_colour: BowlColour
  pollinator_group: PollinatorGroup
  caste: Caste
  sex: Sex
  genus: string
  species: string
  modifier: Modifier
  species_name: string // derived
  id_code: string
  determiner: string
  comments: string
  image_url: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export type SurveyInsert = Omit<Survey, 'id' | 'label_number' | 'created_at' | 'updated_at' | 'user_id'>
export type SurveyUpdate = Partial<SurveyInsert>
