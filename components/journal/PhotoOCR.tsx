'use client'
import { useState } from 'react'
import { Upload, Loader } from 'lucide-react'
import Tesseract from 'tesseract.js'
import { toast } from 'sonner'

interface Props {
  onExtract: (data: {
    name?: string
    city?: string
    address?: string
  }) => void
}

export default function PhotoOCR({ onExtract }: Props) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string>('')

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const url = URL.createObjectURL(file)
    setPreview(url)

    setLoading(true)
    try {
      // OCR - extract text dari gambar
      const result = await Tesseract.recognize(
        file,
        'ind', // Indonesian language
        {
          logger: (m) => console.log('OCR progress:', m.progress),
        }
      )

      const text = result.data.text
      console.log('Extracted text:', text)

      // Parse text untuk ambil informasi
      const extracted = parseTextForInfo(text)
      
      toast.success('Photo analyzed! Check the fields below.')
      onExtract(extracted)

    } catch (error) {
      console.error('OCR error:', error)
      toast.error('Failed to analyze photo')
    } finally {
      setLoading(false)
    }
  }

  // Parser untuk extract nama, alamat, kota dari text
  function parseTextForInfo(text: string) {
    const lines = text.split('\n').filter(l => l.trim().length > 0)
    
    // Heuristics sederhana
    const data: { name?: string; city?: string; address?: string } = {}

    // Cari nama (biasanya baris pertama atau baris dengan huruf besar)
    const nameLines = lines.filter(l => /^[A-Z]/.test(l.trim()))
    if (nameLines.length > 0) {
      data.name = nameLines[0].substring(0, 100) // ambil max 100 char
    }

    // Cari kota (kata2 umum: "Jakarta", "Bandung", dll)
    const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta', 'Bali', 'Tangerang', 'Bekasi']
    for (const city of cities) {
      if (text.includes(city)) {
        data.city = city
        break
      }
    }

    // Cari alamat (biasanya ada "Jl.", "Jalan", "No.", etc)
    const addressLine = lines.find(l => /Jl\.|Jalan|No\.|Komplek|Blok/i.test(l))
    if (addressLine) {
      data.address = addressLine.substring(0, 200)
    }

    return data
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Auto-Fill dari Screenshot</label>
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl cursor-pointer hover:border-blue-400 transition-all">
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover rounded-lg" />
          ) : loading ? (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader className="w-5 h-5 animate-spin" />
              Analyzing photo...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-blue-500" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                Click to upload screenshot
              </span>
              <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoSelect}
            disabled={loading}
          />
        </label>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        💡 Upload screenshot menu, poster, atau tanda tempat. Info akan di-extract otomatis.
      </p>
    </div>
  )
}