'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Baby, ChevronRight } from 'lucide-react'
import { cn, formatDate, getStatusColor, getVerdictColor, getTypeColor } from '@/lib/utils'
import type { FamilyJournal, JournalType } from '@/types'
import { PLACE_CATEGORIES, EVENT_CATEGORIES } from '@/types'
import StarRating from '@/components/ui/StarRating'

interface Props {
  initialJournals: FamilyJournal[]
}

export default function TimelineView({ initialJournals }: Props) {
  const [yearFilter, setYearFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<JournalType | ''>('')

  const years = useMemo(() => {
    const ys = new Set<string>()
    initialJournals.forEach(j => {
      const d = j.visit_date || j.event_start_date
      if (d) ys.add(new Date(d).getFullYear().toString())
    })
    return Array.from(ys).sort((a, b) => Number(b) - Number(a))
  }, [initialJournals])

  const cities = useMemo(() => {
    const cs = new Set<string>()
    initialJournals.forEach(j => { if (j.city) cs.add(j.city) })
    return Array.from(cs).sort()
  }, [initialJournals])

  const filtered = useMemo(() => {
    let result = [...initialJournals]
    if (yearFilter) result = result.filter(j => {
      const d = j.visit_date || j.event_start_date
      return d && new Date(d).getFullYear().toString() === yearFilter
    })
    if (categoryFilter) result = result.filter(j => j.category === categoryFilter)
    if (cityFilter) result = result.filter(j => j.city === cityFilter)
    if (typeFilter) result = result.filter(j => j.type === typeFilter)
    return result
  }, [initialJournals, yearFilter, categoryFilter, cityFilter, typeFilter])

  // Group by year-month
  const grouped = useMemo(() => {
    const map = new Map<string, FamilyJournal[]>()
    filtered.forEach(j => {
      const d = j.visit_date || j.event_start_date
      if (!d) return
      const key = new Date(d).toLocaleDateString('default', { year: 'numeric', month: 'long' })
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(j)
    })
    return Array.from(map.entries())
  }, [filtered])

  if (initialJournals.length === 0) {
    return (
      <div className="card p-16 text-center">
        <p className="text-5xl mb-3">🗓️</p>
        <p className="font-semibold text-gray-700 dark:text-gray-300">No dated entries yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add dates to your journal entries to see them on the timeline.</p>
        <Link href="/journals/new" className="btn-primary mt-4 inline-flex">Add Entry</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select className="input text-sm" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="input text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value as JournalType | '')}>
            <option value="">All Types</option>
            <option value="PLACE">Place</option>
            <option value="EVENT">Event</option>
          </select>
          <select className="input text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {[...PLACE_CATEGORIES, ...EVENT_CATEGORIES].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input text-sm" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 dark:text-gray-600">
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-medium">No results match your filters</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-300 via-orange-200 to-transparent dark:from-brand-800 dark:via-orange-900/30 hidden sm:block" />

          <div className="space-y-8">
            {grouped.map(([monthLabel, items]) => (
              <div key={monthLabel} className="sm:pl-10 relative">
                {/* Month dot */}
                <div className="hidden sm:flex absolute left-0 w-9 h-9 rounded-full bg-brand-500 text-white items-center justify-center shadow-md shadow-orange-200 dark:shadow-orange-900/30 top-0 z-10">
                  <Calendar className="w-4 h-4" />
                </div>

                <div className="mb-3">
                  <span className="inline-block bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {monthLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map(journal => {
                    const photo = (journal as FamilyJournal & { journal_photos?: Array<{file_url: string|null}> }).journal_photos?.[0]
                    return (
                      <Link
                        key={journal.id}
                        href={`/journals/${journal.id}`}
                        className="card p-4 flex items-start gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
                      >
                        {photo?.file_url ? (
                          <img src={photo.file_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${journal.type === 'PLACE' ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                            {journal.type === 'PLACE'
                              ? <MapPin className="w-6 h-6 text-orange-400 dark:text-orange-500" />
                              : <Calendar className="w-6 h-6 text-blue-400 dark:text-blue-500" />
                            }
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-1">
                            <span className={cn('badge text-xs', getTypeColor(journal.type))}>{journal.type}</span>
                            <span className={cn('badge text-xs', getStatusColor(journal.status))}>{journal.status}</span>
                            {journal.family_verdict && (
                              <span className={cn('badge text-xs', getVerdictColor(journal.family_verdict))}>{journal.family_verdict}</span>
                            )}
                            {journal.kid_friendly && (
                              <Baby className="w-3.5 h-3.5 text-pink-400" />
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{journal.name}</h3>
                          <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {journal.category && <span>{journal.category}</span>}
                            {journal.city && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />{journal.city}
                              </span>
                            )}
                            {journal.rating && <StarRating rating={journal.rating} size="sm" />}
                          </div>
                          {journal.notes && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{journal.notes}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-400 flex-shrink-0 mt-1 transition-colors" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
