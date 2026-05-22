import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { Profile } from '@/lib/types'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('app_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_approved) redirect('/auth/pending')
  if (profile.role !== 'admin' && profile.role !== 'manager') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-stone-50">
      <NavBar profile={profile as Profile} isAdmin={true} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 border-b border-gray-200 pb-4">
          <Link href="/admin" className="px-4 py-2 text-sm rounded-full hover:bg-teal-50 text-gray-600 font-medium hover:text-teal-700 transition-colors">
            Overview
          </Link>
          <Link href="/admin/staff" className="px-4 py-2 text-sm rounded-full hover:bg-teal-50 text-gray-600 font-medium hover:text-teal-700 transition-colors">
            Staff
          </Link>
          <Link href="/admin/modules" className="px-4 py-2 text-sm rounded-full hover:bg-teal-50 text-gray-600 font-medium hover:text-teal-700 transition-colors">
            Modules
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
