import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import { MapPin, Calendar, Heart, CheckSquare, TrendingUp, Baby, Star, Flame } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, display_name')
    .eq('id', user.id)
    .single()

  const { data: journals } = await supabase
    .from('family_journals')
    .select('*')
    .eq('user_id', user.id)

  const data = journals || []

  const stats = {
    totalPlaces: data.filter(j => j.type === 'PLACE').length,
    totalEvents: data.filter(j => j.type === 'EVENT').length,
    totalWishlist: data.filter(j => j.status === 'WISHLIST').length,
    totalVisited: data.filter(j => j.status === 'VISITED' || j.status === 'ATTENDED').length,
    totalUpcoming: data.filter(j => j.status === 'UPCOMING').length,
    averageRating: data.filter(j => j.rating).reduce((acc, j, _, arr) =>
      acc + (j.rating / arr.filter(x => x.rating).length), 0),
    kidFriendlyPlaces: data.filter(j => j.kid_friendly && j.type === 'PLACE').length,
    mustTryPlaces: data.filter(j => j.family_verdict === 'MUST TRY').length,
  }

  const displayName = profile?.display_name || profile?.first_name || 'there'
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  const statCards = [
    { label: 'Total Places', value: stats.totalPlaces, icon: MapPin, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Wishlist', value: stats.totalWishlist, icon: Heart, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
    { label: 'Visited / Attended', value: stats.totalVisited, icon: CheckSquare, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { label: 'Upcoming Events', value: stats.totalUpcoming, icon: TrendingUp, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Avg Rating', value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—', icon: Star, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'Kid Friendly', value: stats.kidFriendlyPlaces, icon: Baby, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { label: 'Must Try', value: stats.mustTryPlaces, icon: Flame, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{greeting}, {displayName}! 👋</p>
        <h1 className="page-header mt-0.5">Your Family Journal</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 hover:shadow-md transition-all duration-200">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts journals={data} />
    </div>
  )
}
