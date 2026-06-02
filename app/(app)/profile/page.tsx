import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import TelegramLinkSection from '@/components/TelegramLinkSection'
import { User } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: telegramLink } = await supabase
    .from('telegram_user_links')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <User className="w-6 h-6 text-brand-500" />My Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account settings</p>
      </div>

      <ProfileForm profile={profile} userId={user.id} />
      <TelegramLinkSection telegramLink={telegramLink} userId={user.id} />
    </div>
  )
}
