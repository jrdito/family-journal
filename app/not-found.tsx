import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="text-7xl mb-4">🗺️</p>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          This page doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
