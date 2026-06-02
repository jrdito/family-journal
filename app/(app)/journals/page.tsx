import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import JournalList from '@/components/journal/JournalList'
import Link from 'next/link'
import { Plus, Download } from 'lucide-react'

export default async function JournalsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: journals } = await supabase
    .from('family_journals')
    .select('*, journal_photos(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header">All Journals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {journals?.length || 0} entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/export" className="btn-secondary text-xs py-2 px-3">
            <Download className="w-3.5 h-3.5" />
            Export XLSX
          </a>
          <Link href="/journals/new" className="btn-primary text-xs py-2">
            <Plus className="w-3.5 h-3.5" />
            Add Entry
          </Link>
        </div>
      </div>
      <JournalList initialJournals={journals || []} />
    </div>
  )
}
