import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import JournalForm from '@/components/journal/JournalForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewJournalPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/journals" className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="page-header">New Entry</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add a place or event to your journal</p>
        </div>
      </div>
      <JournalForm userId={user.id} mode="create" />
    </div>
  )
}
