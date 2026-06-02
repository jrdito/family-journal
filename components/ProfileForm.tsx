'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, User } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
  userId: string
}

export default function ProfileForm({ profile, userId }: Props) {
  const supabase = createClient()
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [loading, setLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        display_name: displayName || `${firstName} ${lastName}`.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated!')
    }
    setLoading(false)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xl overflow-hidden">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            : getInitials(profile?.first_name, profile?.last_name)
          }
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-lg">
            {profile?.display_name || `${profile?.first_name} ${profile?.last_name}` || 'Your Name'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
            profile?.role === 'admin'
              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {profile?.role || 'user'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">First Name</label>
            <input
              className="input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input
              className="input"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>
        <div>
          <label className="label">Display Name</label>
          <input
            className="input"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="How others see your name"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input opacity-60 cursor-not-allowed"
            value={profile?.email || ''}
            disabled
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            </span>
          ) : (
            <><Save className="w-4 h-4" />Save Changes</>
          )}
        </button>
      </form>
    </div>
  )
}
