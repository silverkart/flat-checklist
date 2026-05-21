export type Profile = {
  id: string
  full_name: string | null
  role: 'admin' | 'manager' | 'staff'
  is_approved: boolean
  created_at: string
  updated_at: string
}

export type MenuItem = {
  id: string
  name: string
  category: 'antipasti' | 'mains' | 'classics' | 'grills' | 'dessert' | 'sides'
  subtitle: string | null   // ingredient components list
  description: string       // detailed training explanation
  sell_line: string | null  // suggested selling line
  price: string | null
  tags: string[]
  allergens: string[]
  available: boolean
  sort_order: number
}

export type Wine = {
  id: string
  name: string
  region: string
  category: 'sparkling' | 'white' | 'rose' | 'red' | 'dessert'
  tasting_notes: string
  serving_temp: string
  food_pairing: string
  available: boolean
  sort_order: number
}

export type ServiceStep = {
  id: string
  step_number: number
  title: string
  intro: string
  bullets: string[]
  tip: string | null
  active: boolean
}

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correct_index: number
  explanation: string
  active: boolean
}

export type StaffProgress = {
  id: string
  user_id: string
  module_slug: string
  completed_at: string
  score: number | null
  attempt_count: number
}

export type HandbookSection = {
  id: string
  title: string
  content: string
  sort_order: number
  active: boolean
}

export const MODULES = [
  { slug: 'menu',     label: 'Menu Training',     icon: '🍽️', hasQuiz: true },
  { slug: 'wine',     label: 'Wine Training',      icon: '🍷', hasQuiz: true },
  { slug: 'service',  label: 'Order of Service',   icon: '📋', hasQuiz: false },
  { slug: 'handbook', label: 'Staff Handbook',     icon: '📖', hasQuiz: false },
] as const
