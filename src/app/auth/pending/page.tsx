import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'

export default async function PendingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('app_profiles')
    .select('is_approved, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.is_approved) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-forest-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-gold-500 text-5xl mb-3">🦌</div>
          <h1 className="text-white text-2xl font-semibold tracking-wide">Banchory Lodge</h1>
          <p className="text-forest-300 text-sm mt-1">Staff Portal</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
          <div className="text-4xl mb-3">⏳</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Awaiting approval</h2>
          <p className="text-gray-500 text-sm mb-1">
            Hi {profile?.full_name || user.email?.split('@')[0]},
          </p>
          <p className="text-gray-500 text-sm mb-5">
            Your account is registered but needs to be approved by a manager before you can access the portal.
            You'll receive an email once you're approved.
          </p>
          <p className="text-gray-400 text-xs mb-5">{user.email}</p>
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
