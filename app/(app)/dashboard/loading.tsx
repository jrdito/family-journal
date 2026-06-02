export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card p-4 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-52" />
        ))}
      </div>
    </div>
  )
}
