import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TimelineView from '@/components/journal/TimelineView'
import { Clock } from 'lucide-react'

export default async function TimelinePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: journals } = await supabase
    .from('family_journals')
    .select('*, journal_photos(*)')
    .eq('user_id', user.id)
    .not('visit_date', 'is', null)
    .not('event_start_date', 'is', null)
    .order('visit_date', { ascending: false })

  // Also get ones with event_start_date
  const { data: eventJournals } = await supabase
    .from('family_journals')
    .select('*, journal_photos(*)')
    .eq('user_id', user.id)
    .is('visit_date', null)
    .not('event_start_date', 'is', null)
    .order('event_start_date', { ascending: false })

  const allJournals = [...(journals || []), ...(eventJournals || [])]
    .sort((a, b) => {
      const dateA = new Date(a.visit_date || a.event_start_date || a.created_at).getTime()
      const dateB = new Date(b.visit_date || b.event_start_date || b.created_at).getTime()
      return dateB - dateA
    })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-500" />Family Timeline
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your family memories, in order</p>
      </div>
      <TimelineView initialJournals={allJournals} />
    </div>
  )
}
