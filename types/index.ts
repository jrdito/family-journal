export type UserRole = 'user' | 'admin'
export type JournalType = 'PLACE' | 'EVENT'
export type PlaceStatus = 'WISHLIST' | 'VISITED' | 'CANCELLED'
export type EventStatus = 'WISHLIST' | 'UPCOMING' | 'ATTENDED' | 'CANCELLED'
export type JournalStatus = PlaceStatus | EventStatus
export type FamilyVerdict = 'MUST TRY' | 'WORTH IT' | 'BIASA AJA' | 'SKIP' | 'COMEBACK'
export type JournalSource = 'WEB' | 'TELEGRAM'

export type PlaceCategory =
  | 'Restaurant'
  | 'Cafe'
  | 'Kids Playground'
  | 'Tourist Attraction'
  | 'Mall'
  | 'Hotel'
  | 'Outdoor'
  | 'Other'

export type EventCategory =
  | 'Kids Event'
  | 'Family Event'
  | 'Bazaar'
  | 'Exhibition'
  | 'Concert'
  | 'Workshop'
  | 'School Event'
  | 'Mall Event'
  | 'Festival'
  | 'Other'

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  email: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FamilyJournal {
  id: string
  user_id: string
  type: JournalType
  name: string
  category: string | null
  city: string | null
  address: string | null
  location_name: string | null
  google_maps_url: string | null
  status: JournalStatus
  visit_date: string | null
  event_start_date: string | null
  event_end_date: string | null
  event_time: string | null
  ticket_price: number | null
  ticket_link: string | null
  rating: number | null
  kid_friendly: boolean
  budget_estimate: number | null
  family_verdict: FamilyVerdict | null
  notes: string | null
  source: JournalSource
  created_at: string
  updated_at: string
  journal_photos?: JournalPhoto[]
}

export interface JournalPhoto {
  id: string
  journal_id: string
  user_id: string
  file_name: string | null
  file_path: string | null
  file_url: string | null
  mime_type: string | null
  file_size: number | null
  uploaded_at: string
}

export interface TelegramUserLink {
  id: string
  user_id: string | null
  telegram_id: string | null
  telegram_username: string | null
  link_code: string | null
  is_linked: boolean
  linked_at: string | null
  created_at: string
}

export interface DashboardStats {
  totalPlaces: number
  totalEvents: number
  totalWishlist: number
  totalVisited: number
  totalUpcoming: number
  averageRating: number
  kidFriendlyPlaces: number
  mustTryPlaces: number
}

export interface JournalFilters {
  search?: string
  city?: string
  category?: string
  type?: JournalType | ''
  status?: JournalStatus | ''
  kid_friendly?: boolean | ''
  family_verdict?: FamilyVerdict | ''
  sort?: 'newest' | 'oldest' | 'highest_rating'
}

export const PLACE_CATEGORIES: PlaceCategory[] = [
  'Restaurant',
  'Cafe',
  'Kids Playground',
  'Tourist Attraction',
  'Mall',
  'Hotel',
  'Outdoor',
  'Other',
]

export const EVENT_CATEGORIES: EventCategory[] = [
  'Kids Event',
  'Family Event',
  'Bazaar',
  'Exhibition',
  'Concert',
  'Workshop',
  'School Event',
  'Mall Event',
  'Festival',
  'Other',
]

export const FAMILY_VERDICTS: FamilyVerdict[] = [
  'MUST TRY',
  'WORTH IT',
  'BIASA AJA',
  'SKIP',
  'COMEBACK',
]

export const PLACE_STATUSES: PlaceStatus[] = ['WISHLIST', 'VISITED', 'CANCELLED']
export const EVENT_STATUSES: EventStatus[] = ['WISHLIST', 'UPCOMING', 'ATTENDED', 'CANCELLED']
