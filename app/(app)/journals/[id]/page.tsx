import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, MapPin, Calendar, Star, Baby, ExternalLink, Trash2 } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor, getVerdictColor, getTypeColor, cn } from '@/lib/utils'
import PhotoGallery from '@/components/journal/PhotoGallery'
import DeleteJournalButton from '@/components/journal/DeleteJournalButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function JournalDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: journal } = await supabase
    .from('family_journals')
    .select('*, journal_photos(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!journal) notFound()

  const photos = journal.journal_photos || []

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/journals" className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="page-header truncate max-w-xs sm:max-w-none">{journal.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/journals/${id}/edit`} className="btn-secondary text-xs py-2">
            <Edit className="w-3.5 h-3.5" />Edit
          </Link>
          <DeleteJournalButton journalId={id} />
        </div>
      </div>

      {/* Photos */}
      {photos.length > 0 && <PhotoGallery photos={photos} />}

      {/* Main Info Card */}
      <div className="card p-5 space-y-4 mt-4">
        <div className="flex flex-wrap gap-2">
          <span className={cn('badge', getTypeColor(journal.type))}>
            {journal.type === 'PLACE' ? <MapPin className="w-3 h-3 mr-1" /> : <Calendar className="w-3 h-3 mr-1" />}
            {journal.type}
          </span>
          <span className={cn('badge', getStatusColor(journal.status))}>{journal.status}</span>
          {journal.family_verdict && (
            <span className={cn('badge', getVerdictColor(journal.family_verdict))}>{journal.family_verdict}</span>
          )}
          {journal.kid_friendly && (
            <span className="badge bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
              <Baby className="w-3 h-3 mr-1" />Kid Friendly
            </span>
          )}
        </div>

        {journal.rating && (
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-5 h-5 ${s <= journal.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
            ))}
            <span className="ml-1 text-sm font-semibold text-gray-600 dark:text-gray-400">{journal.rating}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {journal.category && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Category</p>
              <p className="text-gray-900 dark:text-white font-semibold mt-0.5">{journal.category}</p>
            </div>
          )}
          {journal.city && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">City</p>
              <p className="text-gray-900 dark:text-white font-semibold mt-0.5">{journal.city}</p>
            </div>
          )}
          {(journal.visit_date || journal.event_start_date) && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Date</p>
              <p className="text-gray-900 dark:text-white font-semibold mt-0.5">
                {formatDate(journal.visit_date || journal.event_start_date)}
                {journal.event_end_date && ` — ${formatDate(journal.event_end_date)}`}
              </p>
            </div>
          )}
          {journal.event_time && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Time</p>
              <p className="text-gray-900 dark:text-white font-semibold mt-0.5">{journal.event_time}</p>
            </div>
          )}
          {journal.budget_estimate && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Budget Estimate</p>
              <p className="text-gray-900 dark:text-white font-semibold mt-0.5">{formatCurrency(journal.budget_estimate)}</p>
            </div>
          )}
          {journal.ticket_price !== null && journal.ticket_price !== undefined && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Ticket Price</p>
              <p className="text-gray-900 dark:text-white font-semibold mt-0.5">
                {journal.ticket_price === 0 ? 'Free' : formatCurrency(journal.ticket_price)}
              </p>
            </div>
          )}
        </div>

        {journal.address && (
          <div>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Address</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{journal.address}</p>
          </div>
        )}

        {journal.location_name && (
          <div>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Location</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{journal.location_name}</p>
          </div>
        )}

        {journal.notes && (
          <div>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Notes</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{journal.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {journal.google_maps_url && (
            <a href={journal.google_maps_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2">
              <MapPin className="w-3.5 h-3.5" />Open Maps
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {journal.ticket_link && (
            <a href={journal.ticket_link} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2">
              <ExternalLink className="w-3.5 h-3.5" />Get Tickets
            </a>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Added via {journal.source} · {formatDate(journal.created_at)}
          </p>
        </div>
      </div>
    </div>
  )
}
