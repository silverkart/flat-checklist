import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('app_profiles')
    .select('is_approved, role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_approved) redirect('/auth/pending')

  if (profile.role === 'admin' || profile.role === 'manager') redirect('/admin')

  redirect('/dashboard')
}
