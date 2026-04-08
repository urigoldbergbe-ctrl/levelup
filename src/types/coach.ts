export interface Coach {
  id: string
  name: string
  email: string
  phone: string | null
  bio: string | null
  calendly_url: string
  photo_url: string | null
  active: boolean
  created_at: string
}

export interface CoachSession {
  id: string
  user_id: string
  coach_id: string
  session_at: string
  tasks: string[]
  notes: string | null
  created_at: string
}
