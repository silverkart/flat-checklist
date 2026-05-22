import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
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
    <div className="min-h-screen bg-teal-600 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo.svg" alt="Banchory Lodge" width={200} height={50} className="h-14 w-auto brightness-0 invert" />
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-2xl text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="font-serif text-xl text-gray-900 mb-2">Awaiting approval</h2>
          <p className="text-gray-500 text-sm mb-1">
            Hi {profile?.full_name || user.email?.split('@')[0]},
          </p>
          <p className="text-gray-500 text-sm mb-5">
            Your account has been created. A manager needs to approve your access before you can use the portal — this is usually done within one working day.
          </p>
          <p className="text-gray-400 text-xs mb-6">{user.email}</p>
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
