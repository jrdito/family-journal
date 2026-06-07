'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, X, MapPin, Calendar, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { FamilyJournal, JournalType } from '@/types'
import {
  PLACE_CATEGORIES, EVENT_CATEGORIES, FAMILY_VERDICTS,
  PLACE_STATUSES, EVENT_STATUSES
} from '@/types'
import StarRating from '@/components/ui/StarRating'

interface Props {
  userId: string
  journal?: FamilyJournal
  mode: 'create' | 'edit'
}

export default function JournalForm({ userId, journal, mode }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [type, setType] = useState<JournalType>(journal?.type || 'PLACE')
  const [name, setName] = useState(journal?.name || '')
  const [category, setCategory] = useState(journal?.category || '')
  const [city, setCity] = useState(journal?.city || '')
  const [address, setAddress] = useState(journal?.address || '')
  const [locationName, setLocationName] = useState(journal?.location_name || '')
  const [googleMapsUrl, setGoogleMapsUrl] = useState(journal?.google_maps_url || '')
  const [status, setStatus] = useState(journal?.status || 'WISHLIST')
  const [visitDate, setVisitDate] = useState(journal?.visit_date || '')
  const [eventStartDate, setEventStartDate] = useState(journal?.event_start_date || '')
  const [eventEndDate, setEventEndDate] = useState(journal?.event_end_date || '')
  const [eventTime, setEventTime] = useState(journal?.event_time || '')
  const [ticketPrice, setTicketPrice] = useState(journal?.ticket_price?.toString() || '')
  const [ticketLink, setTicketLink] = useState(journal?.ticket_link || '')
  const [rating, setRating] = useState(journal?.rating || 0)
  const [kidFriendly, setKidFriendly] = useState(journal?.kid_friendly || false)
  const [budgetEstimate, setBudgetEstimate] = useState(journal?.budget_estimate?.toString() || '')
  const [familyVerdict, setFamilyVerdict] = useState(journal?.family_verdict || '')
  const [notes, setNotes] = useState(journal?.notes || '')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])

  const categories = type === 'PLACE' ? PLACE_CATEGORIES : EVENT_CATEGORIES
  const statuses = type === 'PLACE' ? PLACE_STATUSES : EVENT_STATUSES

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const valid = files.filter(f => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        toast.error(`${f.name} is not a valid image type`)
        return false
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 10MB limit`)
        return false
      }
      return true
    })
    setPhotoFiles(prev => [...prev, ...valid])
    valid.forEach(f => {
      const url = URL.createObjectURL(f)
      setPhotoPreviewUrls(prev => [...prev, url])
    })
  }

  function removePhoto(idx: number) {
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreviewUrls(prev => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function uploadPhotos(journalId: string) {
  if (photoFiles.length === 0) return
  setUploading(true)
  try {
    for (const file of photoFiles) {
      const timestamp = Date.now()
      const filePath = `users/${userId}/journals/${journalId}/${timestamp}-${file.name}`
      
      console.log('Uploading file:', filePath)
      
      // Upload file ke storage
      const { data, error: uploadError } = await supabase.storage
        .from('family-journal-photos') // ← GANTI KE NAMA BUCKET ANDA
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type,
        })
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error(`Failed to upload ${file.name}: ${uploadError.message}`)
        continue
      }

      console.log('File uploaded:', data)
      
      // Generate signed URL (valid 1 tahun)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('family-journal-photos') // ← GANTI KE NAMA BUCKET ANDA
        .createSignedUrl(filePath, 60 * 60 * 24 * 365)
      
      if (urlError) {
        console.error('URL error:', urlError)
        toast.error(`Failed to generate URL: ${urlError.message}`)
        continue
      }

      console.log('Signed URL:', urlData?.signedUrl)
      
      // Simpan metadata ke database
      const { error: dbError } = await supabase.from('journal_photos').insert({
        journal_id: journalId,
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_url: urlData.signedUrl,
        mime_type: file.type,
        file_size: file.size,
      })

      if (dbError) {
        console.error('Database error:', dbError)
        toast.error(`Failed to save photo metadata: ${dbError.message}`)
        continue
      }

      console.log('Photo saved to database')
      toast.success(`${file.name} uploaded!`)
    }
  } catch (error) {
    console.error('Upload error:', error)
    toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setUploading(false)
  }
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    if (!status) { toast.error('Status is required'); return }

    setLoading(true)
    try {
      const payload = {
        user_id: userId,
        type,
        name: name.trim(),
        category: category || null,
        city: city.trim() || null,
        address: address.trim() || null,
        location_name: locationName.trim() || null,
        google_maps_url: googleMapsUrl.trim() || null,
        status,
        visit_date: type === 'PLACE' && visitDate ? visitDate : null,
        event_start_date: type === 'EVENT' && eventStartDate ? eventStartDate : null,
        event_end_date: type === 'EVENT' && eventEndDate ? eventEndDate : null,
        event_time: type === 'EVENT' && eventTime ? eventTime : null,
        ticket_price: ticketPrice ? parseFloat(ticketPrice) : null,
        ticket_link: ticketLink.trim() || null,
        rating: rating || null,
        kid_friendly: kidFriendly,
        budget_estimate: budgetEstimate ? parseFloat(budgetEstimate) : null,
        family_verdict: familyVerdict || null,
        notes: notes.trim() || null,
        source: 'WEB',
      }

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('family_journals')
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        if (photoFiles.length > 0) await uploadPhotos(data.id)
        toast.success('Entry created!')
        router.push(`/journals/${data.id}`)
      } else if (journal?.id) {
        const { error } = await supabase
          .from('family_journals')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', journal.id)
        if (error) throw error
        if (photoFiles.length > 0) await uploadPhotos(journal.id)
        toast.success('Entry updated!')
        router.push(`/journals/${journal.id}`)
      }
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type Selector */}
      <div className="card p-5">
        <label className="label text-base mb-3">Entry Type</label>
        <div className="grid grid-cols-2 gap-3">
          {(['PLACE', 'EVENT'] as JournalType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setStatus('WISHLIST'); setCategory('') }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                type === t
                  ? t === 'PLACE'
                    ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20'
                    : 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              {t === 'PLACE' ? <MapPin className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Fields */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm">{type === 'PLACE' ? 'Place' : 'Event'} Details</h3>

        <div>
          <label className="label">{type === 'PLACE' ? 'Place Name' : 'Event Name'} *</label>
          <input className="input" placeholder="Enter name..." value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status *</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value as typeof status)} required>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">City</label>
            <input className="input" placeholder="City..." value={city} onChange={e => setCity(e.target.value)} />
          </div>
          {type === 'PLACE' ? (
            <div>
              <label className="label">Visit Date</label>
              <input type="date" className="input" value={visitDate} onChange={e => setVisitDate(e.target.value)} />
            </div>
          ) : (
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={eventStartDate} onChange={e => setEventStartDate(e.target.value)} />
            </div>
          )}
        </div>

        {type === 'PLACE' ? (
          <div>
            <label className="label">Address</label>
            <input className="input" placeholder="Full address..." value={address} onChange={e => setAddress(e.target.value)} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Event Time</label>
              <input type="time" className="input" value={eventTime} onChange={e => setEventTime(e.target.value)} />
            </div>
          </div>
        )}

        {type === 'EVENT' && (
          <div>
            <label className="label">Location Name</label>
            <input className="input" placeholder="Venue name..." value={locationName} onChange={e => setLocationName(e.target.value)} />
          </div>
        )}

        <div>
          <label className="label">Google Maps URL</label>
          <input type="url" className="input" placeholder="https://maps.google.com/..." value={googleMapsUrl} onChange={e => setGoogleMapsUrl(e.target.value)} />
        </div>

        {type === 'EVENT' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Ticket Price (IDR)</label>
              <input type="number" className="input" placeholder="0" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} min="0" />
            </div>
            <div>
              <label className="label">Ticket Link</label>
              <input type="url" className="input" placeholder="https://..." value={ticketLink} onChange={e => setTicketLink(e.target.value)} />
            </div>
          </div>
        )}

        {type === 'PLACE' && (
          <div>
            <label className="label">Budget Estimate (IDR)</label>
            <input type="number" className="input" placeholder="0" value={budgetEstimate} onChange={e => setBudgetEstimate(e.target.value)} min="0" />
          </div>
        )}
      </div>

      {/* Review Fields */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Review</h3>

        <div>
          <label className="label">Rating</label>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? 0 : star)}
                className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
              >★</button>
            ))}
            {rating > 0 && <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{rating}.0</span>}
          </div>
        </div>

        <div>
          <label className="label">Family Verdict</label>
          <div className="flex flex-wrap gap-2">
            {FAMILY_VERDICTS.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setFamilyVerdict(familyVerdict === v ? '' : v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                  familyVerdict === v
                    ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setKidFriendly(!kidFriendly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
              kidFriendly
                ? 'border-pink-400 bg-pink-50 text-pink-600 dark:bg-pink-900/20'
                : 'border-gray-200 dark:border-gray-700 text-gray-500'
            }`}
          >
            👶 Kid Friendly
          </button>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[100px] resize-y"
            placeholder="Your thoughts, tips, or memories..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div className="card p-5 space-y-3">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Photos</h3>
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all">
          <Upload className="w-6 h-6 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload photos</span>
          <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — max 10MB each</span>
          <input type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
        </label>
        {photoPreviewUrls.length > 0 && (
          <div className="photo-grid">
            {photoPreviewUrls.map((url, idx) => (
              <div key={idx} className="relative group aspect-square">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pb-6">
        <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading || uploading} className="btn-primary flex-1">
          {loading || uploading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {uploading ? 'Uploading photos...' : 'Saving...'}
            </span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {mode === 'create' ? 'Create Entry' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
