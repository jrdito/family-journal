import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AppSidebar from '@/components/AppSidebar'
import AppHeader from '@/components/AppHeader'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-orange-50/40 dark:bg-gray-950 flex">
      <AppSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AppHeader profile={profile} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
