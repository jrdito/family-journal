'use client'

import { cn } from '@/lib/utils'

interface Props {
  rating: number | null | undefined
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?: (rating: number) => void
}

export default function StarRating({ rating, size = 'md', interactive, onRate }: Props) {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  return (
    <div className={cn('flex items-center gap-0.5', sizes[size])}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => interactive && onRate?.(star)}
          className={cn(
            star <= Math.round(rating || 0) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600',
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
        >
          ★
        </span>
      ))}
      {rating && <span className="ml-1 text-gray-500 dark:text-gray-400 font-medium">{rating.toFixed(1)}</span>}
    </div>
  )
}
