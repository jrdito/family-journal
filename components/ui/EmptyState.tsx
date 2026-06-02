import Link from 'next/link'

interface Props {
  emoji?: string
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ emoji = '📭', title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="card p-16 text-center">
      <p className="text-5xl mb-4">{emoji}</p>
      <p className="font-bold text-gray-700 dark:text-gray-300 text-lg">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-5 inline-flex">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
