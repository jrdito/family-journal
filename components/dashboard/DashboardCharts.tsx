'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import type { FamilyJournal } from '@/types'

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444']

interface Props {
  journals: FamilyJournal[]
}

export default function DashboardCharts({ journals }: Props) {
  // Visits by month
  const visitsByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('default', { month: 'short' })
    const count = journals.filter(j => {
      const date = j.visit_date || j.event_start_date
      if (!date) return false
      return new Date(date).getMonth() === i
    }).length
    return { month, count }
  }).filter(m => m.count > 0)

  // Category distribution
  const categories: Record<string, number> = {}
  journals.forEach(j => {
    if (j.category) {
      categories[j.category] = (categories[j.category] || 0) + 1
    }
  })
  const categoryData = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  // Rating distribution
  const ratingData = [1, 2, 3, 4, 5].map(r => ({
    rating: `${r}★`,
    count: journals.filter(j => j.rating && Math.round(j.rating) === r).length,
  }))

  // Wishlist vs Visited
  const statusData = [
    { name: 'Wishlist', value: journals.filter(j => j.status === 'WISHLIST').length },
    { name: 'Visited/Attended', value: journals.filter(j => j.status === 'VISITED' || j.status === 'ATTENDED').length },
    { name: 'Upcoming', value: journals.filter(j => j.status === 'UPCOMING').length },
    { name: 'Cancelled', value: journals.filter(j => j.status === 'CANCELLED').length },
  ].filter(d => d.value > 0)

  if (journals.length === 0) {
    return (
      <div className="card p-12 text-center text-gray-400 dark:text-gray-600">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm font-medium">No data yet. Start adding journals to see charts!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Visits by Month */}
      {visitsByMonth.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Visits by Month</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={visitsByMonth}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--tw-bg-opacity)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f97316', opacity: 0.1 }}
              />
              <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rating Distribution */}
      {journals.filter(j => j.rating).length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ratingData}>
              <XAxis dataKey="rating" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status Pie */}
      {statusData.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Status Overview</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
