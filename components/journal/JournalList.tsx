'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Calendar, Edit, Trash2, Eye, Baby, Filter, X, Film } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn, formatDate, getStatusColor, getVerdictColor, getTypeColor } from '@/lib/utils'
import type { FamilyJournal, JournalType, JournalStatus, FamilyVerdict } from '@/types'
import { PLACE_CATEGORIES, EVENT_CATEGORIES, MOVIE_CATEGORIES, FAMILY_VERDICTS, PLACE_STATUSES, EVENT_STATUSES, MOVIE_STATUSES } from '@/types'
import StarRating from '@/components/ui/StarRating'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Props {
  initialJournals: FamilyJournal[]
}

export default function JournalList({ initialJournals }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [journals, setJournals] = useState(initialJournals)
  const [search, setSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<JournalType | ''>('')
  const [statusFilter, setStatusFilter] = useState<JournalStatus | ''>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [verdictFilter, setVerdictFilter] = useState<FamilyVerdict | ''>('')
  const [kidFilter, setKidFilter] = useState<boolean | ''>('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest_rating'>('newest')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = [...journals]
    if (search) result = result.filter(j => j.name.toLowerCase().includes(search.toLowerCase()))
    if (citySearch) result = result.filter(j => j.city?.toLowerCase().includes(citySearch.toLowerCase()))
    if (typeFilter) result = result.filter(j => j.type === typeFilter)
    if (statusFilter) result = result.filter(j => j.status === statusFilter)
    if (categoryFilter) result = result.filter(j => j.category === categoryFilter)
    if (verdictFilter) result = result.filter(j => j.family_verdict === verdictFilter)
    if (kidFilter !== '') result = result.filter(j => j.kid_friendly === kidFilter)
    if (sort === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    else if (sort === 'oldest') result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    else if (sort === 'highest_rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return result
  }, [journals, search, citySearch, typeFilter, statusFilter, categoryFilter, verdictFilter, kidFilter, sort])

  async function handleDelete(id: string) {
    const { error } = await supabase.from('family_journals').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete')
    } else {
      setJournals(prev => prev.filter(j => j.id !== id))
      toast.success('Entry deleted')
    }
    setDeleteId(null)
  }

  const activeFilterCount = [typeFilter, statusFilter, categoryFilter, verdictFilter, kidFilter !== '' ? 1 : ''].filter(Boolean).length
  
  const allCategories = [...new Set([...PLACE_CATEGORIES, ...EVENT_CATEGORIES, ...MOVIE_CATEGORIES])]

  return (
    <div className="space-y-4">
      {/* Search + Filter bar */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search by city..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('btn-secondary text-xs px-3 relative', showFilters && 'bg-brand-50 border-brand-200 text-brand-600')}
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <select className="input text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value as JournalType | '')}>
              <option value="">All Types</option>
              <option value="PLACE">Place</option>
              <option value="EVENT">Event</option>
              <option value="MOVIE">Movie</option>
            </select>
            <select className="input text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as JournalStatus | '')}>
              <option value="">All Statuses</option>
              {[...PLACE_STATUSES, ...EVENT_STATUSES.filter(s => !PLACE_STATUSES.includes(s as 'WISHLIST' | 'CANCELLED')), ...MOVIE_STATUSES.filter(s => !PLACE_STATUSES.includes(s as 'WISHLIST' | 'CANCELLED'))].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select className="input text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input text-sm" value={verdictFilter} onChange={e => setVerdictFilter(e.target.value as FamilyVerdict | '')}>
              <option value="">All Verdicts</option>
              {FAMILY_VERDICTS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select className="input text-sm" value={kidFilter as string} onChange={e => setKidFilter(e.target.value === '' ? '' : e.target.value === 'true')}>
              <option value="">Kid Friendly?</option>
              <option value="true">Kid Friendly</option>
              <option value="false">Not Kid Friendly</option>
            </select>
            <select className="input text-sm" value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_rating">Highest Rating</option>
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No entries found</p>
          <Link href="/journals/new" className="btn-primary mt-4 inline-flex">Add First Entry</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(journal => (
            <div key={journal.id} className="card p-4 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={cn('badge', getTypeColor(journal.type))}>
                      {journal.type === 'PLACE' ? <MapPin className="w-3 h-3 mr-1" /> : journal.type === 'EVENT' ? <Calendar className="w-3 h-3 mr-1" /> : <Film className="w-3 h-3 mr-1" />}
                      {journal.type}
                    </span>
                    <span className={cn('badge', getStatusColor(journal.status))}>{journal.status}</span>
                    {journal.family_verdict && (
                      <span className={cn('badge', getVerdictColor(journal.family_verdict))}>{journal.family_verdict}</span>
                    )}
                    {journal.kid_friendly && journal.type !== 'MOVIE' && (
                      <span className="badge bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                        <Baby className="w-3 h-3 mr-1" />Kid
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{journal.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {journal.category && <span>{journal.category}</span>}
                    {journal.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{journal.city}</span>}
                    {(journal.visit_date || journal.event_start_date) && (
                      <span>{formatDate(journal.visit_date || journal.event_start_date)}</span>
                    )}
                    {journal.rating && <StarRating rating={journal.rating} size="sm" />}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Link href={`/journals/${journal.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/journals/${journal.id}/edit`} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(journal.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}