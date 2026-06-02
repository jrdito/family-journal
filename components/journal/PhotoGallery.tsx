'use client'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { JournalPhoto } from '@/types'

interface Props {
  photos: JournalPhoto[]
}

export default function PhotoGallery({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  function prev() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)
  }

  function next() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % photos.length)
  }

  return (
    <>
      <div className="photo-grid mb-4">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(idx)}
            className="aspect-square rounded-xl overflow-hidden hover:scale-105 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <img
              src={photo.file_url || ''}
              alt={photo.file_name || ''}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-5 h-5" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                onClick={e => { e.stopPropagation(); prev() }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                onClick={e => { e.stopPropagation(); next() }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <img
            src={photos[lightboxIndex].file_url || ''}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
