import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import JournalCard from '@/components/journal/JournalCard'
import Link from 'next/link'
import { CheckSquare } from 'lucide-react'

export default async function VisitedPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: journals } = await supabase
    .from('family_journals')
    .select('*, journal_photos(*)')
    .eq('user_id', user.id)
    .in('status', ['VISITED', 'ATTENDED', 'WATCHED'])
    .order('visit_date', { ascending: false })

  const visited = journals?.filter(j => j.type === 'PLACE' && j.status === 'VISITED') || []
  const attended = journals?.filter(j => j.type === 'EVENT' && j.status === 'ATTENDED') || []
  const watched = journals?.filter(j => j.type === 'MOVIE' && j.status === 'WATCHED') || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-green-500" />Visited & Attended
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {(journals?.length || 0)} places, events & movies visited
        </p>
      </div>

      {visited.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Visited Places ({visited.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visited.map(j => <JournalCard key={j.id} journal={j} />)}
          </div>
        </section>
      )}

      {attended.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Attended Events ({attended.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attended.map(j => <JournalCard key={j.id} journal={j} />)}
          </div>
        </section>
      )}

      {watched.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Watched Movies ({watched.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {watched.map(j => <JournalCard key={j.id} journal={j} />)}
          </div>
        </section>
      )}

      {(!visited.length && !attended.length && !watched.length) && (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300">No visits yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start recording your family adventures!</p>
          <Link href="/journals/new" className="btn-primary mt-4 inline-flex">Add First Visit</Link>
        </div>
      )}
    </div>
  )
}