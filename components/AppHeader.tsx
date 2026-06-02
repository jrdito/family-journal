'use client'
import { useRouter } from 'next/navigation'
import { LogOut, Sun, Moon, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Profile } from '@/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AppHeader({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Signed out!')
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-orange-100/70 dark:border-gray-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="lg:hidden w-9" /> {/* Spacer for mobile menu button */}
        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Link
            href="/journals/new"
            className="btn-primary py-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Entry</span>
          </Link>

          <button
            onClick={toggleDark}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
