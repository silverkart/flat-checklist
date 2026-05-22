import Link from 'next/link'
import Image from 'next/image'
import SignOutButton from './SignOutButton'
import { Profile } from '@/lib/types'

export default function NavBar({ profile, isAdmin }: { profile: Profile; isAdmin: boolean }) {
  return (
    <header className="bg-teal-600 text-white sticky top-0 z-10 shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Banchory Lodge" width={120} height={30} className="h-8 w-auto brightness-0 invert" />
        </Link>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/dashboard" className="text-teal-100 hover:text-white text-xs font-medium">
              Staff view
            </Link>
          )}
          {!isAdmin && (profile.role === 'admin' || profile.role === 'manager') && (
            <Link href="/admin" className="text-teal-100 hover:text-white text-xs font-medium">
              Admin
            </Link>
          )}
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold leading-tight">{profile.full_name || 'Staff'}</div>
            <div className="text-teal-200 text-xs capitalize leading-tight">{profile.role}</div>
          </div>
          <SignOutButton className="text-xs text-teal-100 hover:text-white font-medium" />
        </div>
      </div>
    </header>
  )
}
