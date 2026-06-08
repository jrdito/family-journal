import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { FamilyVerdict, JournalStatus, JournalType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getStatusColor(status: JournalStatus): string {
  const colors: Record<string, string> = {
    WISHLIST: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    VISITED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ATTENDED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    WATCHED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    UPCOMING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }
  return colors[status] || 'bg-gray-100 text-gray-500'
}

export function getVerdictColor(verdict: FamilyVerdict | null | undefined): string {
  const colors: Record<string, string> = {
    'MUST TRY': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    'WORTH IT': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'BIASA AJA': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    SKIP: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    COMEBACK: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return verdict ? colors[verdict] || '' : ''
}

export function getTypeColor(type: JournalType): string {
  if (type === 'PLACE') return 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
  if (type === 'EVENT') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (type === 'MOVIE') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  return 'bg-gray-100 text-gray-700'
}

export function renderStars(rating: number | null | undefined): string {
  if (!rating) return '—'
  return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating))
}

export function generateLinkCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.charAt(0)?.toUpperCase() || ''
  const l = lastName?.charAt(0)?.toUpperCase() || ''
  return f + l || '?'
}