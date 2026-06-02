'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Send, CheckCircle, Link, Unlink } from 'lucide-react'
import type { TelegramUserLink } from '@/types'

interface Props {
  telegramLink: TelegramUserLink | null
  userId: string
}

export default function TelegramLinkSection({ telegramLink, userId }: Props) {
  const supabase = createClient()
  const [linkCode, setLinkCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentLink, setCurrentLink] = useState(telegramLink)

  async function handleLinkTelegram(e: React.FormEvent) {
    e.preventDefault()
    if (!linkCode.trim()) { toast.error('Enter a link code'); return }
    setLoading(true)
    try {
      // Find the pending link record with this code
      const { data: pending, error: findError } = await supabase
        .from('telegram_user_links')
        .select('*')
        .eq('link_code', linkCode.toUpperCase().trim())
        .eq('is_linked', false)
        .single()

      if (findError || !pending) {
        toast.error('Invalid or expired link code')
        return
      }

      // Update the record
      const { data: updated, error: updateError } = await supabase
        .from('telegram_user_links')
        .update({
          user_id: userId,
          is_linked: true,
          linked_at: new Date().toISOString(),
        })
        .eq('id', pending.id)
        .select()
        .single()

      if (updateError) throw updateError
      setCurrentLink(updated)
      setLinkCode('')
      toast.success('Telegram account linked! 🎉')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to link Telegram')
    } finally {
      setLoading(false)
    }
  }

  async function handleUnlink() {
    if (!currentLink) return
    setLoading(true)
    await supabase.from('telegram_user_links').delete().eq('id', currentLink.id)
    setCurrentLink(null)
    toast.success('Telegram account unlinked')
    setLoading(false)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">Telegram Bot</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add journal entries via Telegram</p>
        </div>
      </div>

      {currentLink?.is_linked ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Linked!</p>
              {currentLink.telegram_username && (
                <p className="text-xs text-green-600 dark:text-green-500">@{currentLink.telegram_username}</p>
              )}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400">
            <p className="font-semibold mb-1">Available commands:</p>
            <ul className="space-y-0.5 font-mono">
              {['/add_place', '/add_event', '/wishlist', '/visited', '/search', '/random', '/toprated'].map(cmd => (
                <li key={cmd}>{cmd}</li>
              ))}
            </ul>
          </div>
          <button onClick={handleUnlink} disabled={loading} className="btn-secondary w-full text-sm text-red-500 hover:border-red-300">
            <Unlink className="w-4 h-4" />Unlink Telegram
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p className="font-semibold">How to link:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
              <li>Open the Family Journal Bot on Telegram</li>
              <li>Send <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">/link</span></li>
              <li>Bot will send you a 6-character code</li>
              <li>Enter that code below</li>
            </ol>
          </div>
          <form onSubmit={handleLinkTelegram} className="space-y-3">
            <div>
              <label className="label">Link Code</label>
              <input
                className="input font-mono tracking-widest text-center text-lg uppercase"
                placeholder="ABC123"
                value={linkCode}
                onChange={e => setLinkCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <button type="submit" disabled={loading || linkCode.length < 6} className="btn-primary w-full">
              {loading ? 'Linking...' : <><Link className="w-4 h-4" />Link Telegram Account</>}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
