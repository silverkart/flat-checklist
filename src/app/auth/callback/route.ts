import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const origin = url.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  // Create profile if it doesn't exist yet (email-confirmation flow)
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
  await supabase.from('app_profiles').upsert({
    id: user.id,
    full_name: fullName,
    role: 'staff',
    is_approved: false,
  }, { onConflict: 'id', ignoreDuplicates: true })

  const { data: profile } = await supabase
    .from('app_profiles')
    .select('is_approved, role')
    .eq('id', user.id)
    .single()

  if (!profile?.is_approved) return NextResponse.redirect(`${origin}/auth/pending`)
  if (profile.role === 'admin' || profile.role === 'manager') return NextResponse.redirect(`${origin}/admin`)
  return NextResponse.redirect(`${origin}/dashboard`)
}
