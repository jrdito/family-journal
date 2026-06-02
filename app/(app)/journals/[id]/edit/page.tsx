import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import JournalForm from '@/components/journal/JournalForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditJournalPage({ params }: Props) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: journal } = await supabase
    .from('family_journals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!journal) notFound()

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/journals/${id}`} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="page-header">Edit Entry</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{journal.name}</p>
        </div>
      </div>
      <JournalForm userId={user.id} journal={journal} mode="edit" />
    </div>
  )
}
