import Link from 'next/link'
import SignOutButton from './SignOutButton'
import { Profile } from '@/lib/types'

export default function NavBar({ profile, isAdmin }: { profile: Profile; isAdmin: boolean }) {
  return (
    <header className="bg-forest-900 text-white sticky top-0 z-10 shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
          <span className="text-xl">🦌</span>
          <div>
            <div className="text-sm font-semibold leading-tight">Banchory Lodge</div>
            <div className="text-forest-300 text-xs leading-tight">Staff Portal</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/dashboard" className="text-forest-300 hover:text-white text-xs">
              Staff view
            </Link>
          )}
          {!isAdmin && (profile.role === 'admin' || profile.role === 'manager') && (
            <Link href="/admin" className="text-forest-300 hover:text-white text-xs">
              Admin
            </Link>
          )}
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium">{profile.full_name || 'Staff'}</div>
            <div className="text-forest-400 text-xs capitalize">{profile.role}</div>
          </div>
          <SignOutButton className="text-xs text-forest-300 hover:text-white" />
        </div>
      </div>
    </header>
  )
}
