import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Auto-create profile for OAuth users
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        const meta = data.user.user_metadata
        await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: meta.given_name || meta.name?.split(' ')[0] || '',
          last_name: meta.family_name || meta.name?.split(' ').slice(1).join(' ') || '',
          display_name: meta.full_name || meta.name || '',
          email: data.user.email,
          avatar_url: meta.avatar_url || meta.picture || null,
          role: 'user',
        })
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
