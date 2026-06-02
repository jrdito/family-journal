import Link from 'next/link'
import { MapPin, Calendar, Baby } from 'lucide-react'
import { cn, formatDate, getStatusColor, getVerdictColor, getTypeColor } from '@/lib/utils'
import type { FamilyJournal } from '@/types'
import StarRating from '@/components/ui/StarRating'

export default function JournalCard({ journal }: { journal: FamilyJournal }) {
  const photo = (journal as FamilyJournal & { journal_photos?: Array<{file_url: string|null}> }).journal_photos?.[0]

  return (
    <Link href={`/journals/${journal.id}`} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col">
      {photo?.file_url ? (
        <div className="aspect-video overflow-hidden">
          <img src={photo.file_url} alt={journal.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
          {journal.type === 'PLACE'
            ? <MapPin className="w-8 h-8 text-orange-300 dark:text-gray-600" />
            : <Calendar className="w-8 h-8 text-blue-300 dark:text-gray-600" />
          }
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          <span className={cn('badge text-xs', getTypeColor(journal.type))}>{journal.type}</span>
          <span className={cn('badge text-xs', getStatusColor(journal.status))}>{journal.status}</span>
          {journal.kid_friendly && (
            <span className="badge text-xs bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
              <Baby className="w-3 h-3" />
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{journal.name}</h3>
        {journal.category && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{journal.category}</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            {journal.city && <><MapPin className="w-3 h-3" />{journal.city}</>}
          </div>
          {journal.rating ? <StarRating rating={journal.rating} size="sm" /> : (
            journal.family_verdict && (
              <span className={cn('badge text-xs', getVerdictColor(journal.family_verdict))}>{journal.family_verdict}</span>
            )
          )}
        </div>
        {(journal.visit_date || journal.event_start_date) && (
          <p className="text-xs text-gray-400">{formatDate(journal.visit_date || journal.event_start_date)}</p>
        )}
      </div>
    </Link>
  )
}
