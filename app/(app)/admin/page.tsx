import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Users, BookOpen, MapPin, Calendar, Image, Send, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Use admin client for full data access
  const admin = createSupabaseAdminClient()

  const [
    { count: totalUsers },
    { count: totalJournals },
    { count: totalPlaces },
    { count: totalEvents },
    { count: totalPhotos },
    { count: telegramLinked },
    { data: recentUsers },
    { data: recentJournals },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('family_journals').select('*', { count: 'exact', head: true }),
    admin.from('family_journals').select('*', { count: 'exact', head: true }).eq('type', 'PLACE'),
    admin.from('family_journals').select('*', { count: 'exact', head: true }).eq('type', 'EVENT'),
    admin.from('journal_photos').select('*', { count: 'exact', head: true }),
    admin.from('telegram_user_links').select('*', { count: 'exact', head: true }).eq('is_linked', true),
    admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
    admin.from('family_journals').select('*, profiles(email, display_name, first_name, last_name)').order('created_at', { ascending: false }).limit(20),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers || 0, icon: Users, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Total Journals', value: totalJournals || 0, icon: BookOpen, color: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' },
    { label: 'Total Places', value: totalPlaces || 0, icon: MapPin, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { label: 'Total Events', value: totalEvents || 0, icon: Calendar, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Total Photos', value: totalPhotos || 0, icon: Image, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { label: 'Telegram Linked', value: telegramLinked || 0, icon: Send, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="page-header">Admin Panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">System overview & user management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Users */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />Recent Users
          </h2>
          <div className="space-y-2">
            {recentUsers?.map(u => (
              <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold flex-shrink-0 overflow-hidden">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    : ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || '?'
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {u.role}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(u.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Journals */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" />Recent Journals
            </h2>
            <a href="/api/export?all=true" className="text-xs text-brand-500 hover:text-brand-600 font-semibold">
              Export All
            </a>
          </div>
          <div className="space-y-2">
            {recentJournals?.map((j: {
              id: string
              name: string
              type: string
              status: string
              created_at: string
              profiles?: { email?: string; display_name?: string; first_name?: string; last_name?: string } | null
            }) => (
              <div key={j.id} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className={`badge text-xs mt-0.5 flex-shrink-0 ${j.type === 'PLACE' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {j.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{j.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {j.profiles?.email || 'Unknown user'}
                  </p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(j.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
