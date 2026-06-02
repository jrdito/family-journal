'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen, LayoutDashboard, MapPin, Calendar, Heart,
  CheckSquare, Clock, User, Shield, X, Menu
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import type { Profile } from '@/types'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/journals', icon: BookOpen, label: 'All Journals' },
  { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/visited', icon: CheckSquare, label: 'Visited' },
  { href: '/timeline', icon: Clock, label: 'Timeline' },
  { href: '/profile', icon: User, label: 'Profile' },
]

interface Props {
  profile: Profile | null
}

export default function AppSidebar({ profile }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = profile?.role === 'admin'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-orange-100 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-gray-900 dark:text-white text-lg leading-none">Family</span>
          <span className="font-display font-bold text-brand-500 text-lg leading-none"> Journal</span>
        </div>
        <button
          className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                active
                  ? 'bg-brand-500 text-white shadow-sm shadow-orange-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-orange-100/70 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 mt-2',
              pathname === '/admin'
                ? 'bg-purple-500 text-white'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-100/70 dark:hover:bg-purple-900/20'
            )}
          >
            <Shield className="w-4.5 h-4.5" />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-orange-100 dark:border-gray-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              getInitials(profile?.first_name, profile?.last_name)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {profile?.display_name || `${profile?.first_name} ${profile?.last_name}` || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-orange-100/70 dark:border-gray-800 transition-transform duration-300 lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-orange-100/70 dark:border-gray-800">
        <SidebarContent />
      </aside>
    </>
  )
}
