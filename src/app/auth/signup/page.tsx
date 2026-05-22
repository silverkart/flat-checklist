'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)

    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    if (data.session && data.user) {
      await supabase.from('app_profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        role: 'staff',
        is_approved: false,
      }, { onConflict: 'id', ignoreDuplicates: true })

      router.push('/auth/pending')
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-teal-600 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Image src="/logo.svg" alt="Banchory Lodge" width={200} height={50} className="h-14 w-auto brightness-0 invert" />
          </div>
          <div className="bg-white rounded-3xl p-7 shadow-2xl text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="font-serif text-xl mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-5">
              We sent a confirmation link to <strong>{email}</strong>.<br />
              Click it to activate your account, then wait for a manager to approve your access.
            </p>
            <Link href="/auth/login" className="text-teal-600 text-sm font-semibold hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-teal-600 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Image src="/logo.svg" alt="Banchory Lodge" width={200} height={50} className="h-14 w-auto brightness-0 invert" />
          </div>
          <p className="text-teal-200 text-sm tracking-widest uppercase font-medium">Staff Portal</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          <h2 className="font-serif text-2xl text-gray-900 mb-1">Create your account</h2>
          <p className="text-gray-400 text-sm mb-6">A manager will approve your access once registered.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@banchorylodge.com"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-teal-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
