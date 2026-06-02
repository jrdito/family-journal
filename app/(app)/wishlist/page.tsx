import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import JournalCard from '@/components/journal/JournalCard'
import Link from 'next/link'
import { Heart, Plus } from 'lucide-react'

export default async function WishlistPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: journals } = await supabase
    .from('family_journals')
    .select('*, journal_photos(*)')
    .eq('user_id', user.id)
    .in('status', ['WISHLIST', 'UPCOMING'])
    .order('created_at', { ascending: false })

  const wishlist = journals?.filter(j => j.status === 'WISHLIST') || []
  const upcoming = journals?.filter(j => j.status === 'UPCOMING') || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />Wishlist
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Places & events you want to visit</p>
        </div>
        <Link href="/journals/new" className="btn-primary text-xs py-2">
          <Plus className="w-3.5 h-3.5" />Add
        </Link>
      </div>

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Upcoming Events ({upcoming.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map(j => <JournalCard key={j.id} journal={j} />)}
          </div>
        </section>
      )}

      {wishlist.length > 0 ? (
        <section>
          <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Wishlist ({wishlist.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {wishlist.map(j => <JournalCard key={j.id} journal={j} />)}
          </div>
        </section>
      ) : upcoming.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">💭</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start saving places you want to visit!</p>
          <Link href="/journals/new" className="btn-primary mt-4 inline-flex">Add to Wishlist</Link>
        </div>
      ) : null}
    </div>
  )
}
