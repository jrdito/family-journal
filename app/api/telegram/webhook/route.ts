import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { generateLinkCode } from '@/lib/utils'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET!
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

// In-memory conversation state (use Redis/DB for production at scale)
const conversationState = new Map<number, {
  step: string
  type: 'PLACE' | 'EVENT'
  data: Record<string, unknown>
}>()

async function sendMessage(chatId: number, text: string, options?: object) {
  await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...options }),
  })
}

async function sendReplyKeyboard(chatId: number, text: string, buttons: string[][]) {
  await sendMessage(chatId, text, {
    reply_markup: {
      keyboard: buttons.map(row => row.map(text => ({ text }))),
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  })
}

async function removeKeyboard(chatId: number, text: string) {
  await sendMessage(chatId, text, {
    reply_markup: { remove_keyboard: true },
  })
}

async function getLinkedUser(telegramId: string) {
  const admin = createSupabaseAdminClient()
  const { data } = await admin
    .from('telegram_user_links')
    .select('user_id, is_linked')
    .eq('telegram_id', telegramId)
    .eq('is_linked', true)
    .single()
  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCommand(chatId: number, text: string, from: any) {
  const admin = createSupabaseAdminClient()
  const telegramId = String(from.id)
  const username = from.username || ''
  const command = text.split(' ')[0].toLowerCase()

  if (command === '/start' || command === '/help') {
    await sendMessage(chatId, `🏠 <b>Welcome to Family Journal Bot!</b>

Your personal family journal assistant.

<b>Commands:</b>
/link — Link your account
/add_place — Add a place
/add_event — Add an event
/wishlist — View your wishlist
/visited — View visited places
/search — Search journals
/random — Random suggestion
/toprated — Top rated places

First time? Use /link to connect your account.`)
    return
  }

  if (command === '/link') {
    const linkedUser = await getLinkedUser(telegramId)
    if (linkedUser) {
      await sendMessage(chatId, '✅ Your Telegram account is already linked!\n\nUse /help to see available commands.')
      return
    }

    const linkCode = generateLinkCode()
    // Delete any existing pending link for this telegram_id
    const { error: deleteError } = await admin.from('telegram_user_links').delete().eq('telegram_id', telegramId)
    if (deleteError) {
      console.error('Telegram /link cleanup failed:', deleteError)
    }

    const { error: insertError } = await admin.from('telegram_user_links').insert({
      telegram_id: telegramId,
      telegram_username: username,
      link_code: linkCode,
      is_linked: false,
    })

    if (insertError) {
      console.error('Telegram /link insert failed:', insertError)
      await sendMessage(chatId, '⚠️ Sorry, something went wrong while creating your link code. Please try /link again.')
      return
    }

    await sendMessage(chatId, `🔗 <b>Your link code is:</b>

<code>${linkCode}</code>

Go to <b>Family Journal → Profile → Telegram</b> and enter this code.
Code expires when used.`)
    return
  }

  // All other commands require linked account
  const linkedUser = await getLinkedUser(telegramId)
  if (!linkedUser) {
    await sendMessage(chatId, '⚠️ Please link your account first.\n\nUse /link to get a code, then enter it on your profile page.')
    return
  }

  const userId = linkedUser.user_id

  if (command === '/wishlist') {
    const { data } = await admin
      .from('family_journals')
      .select('name, type, category, city')
      .eq('user_id', userId)
      .in('status', ['WISHLIST', 'UPCOMING'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (!data || data.length === 0) {
      await sendMessage(chatId, '📋 Your wishlist is empty!')
      return
    }
    const list = data.map((j, i) => `${i + 1}. <b>${j.name}</b> [${j.type}${j.city ? ` · ${j.city}` : ''}]`).join('\n')
    await sendMessage(chatId, `❤️ <b>Your Wishlist (${data.length})</b>\n\n${list}`)
    return
  }

  if (command === '/visited') {
    const { data } = await admin
      .from('family_journals')
      .select('name, type, rating, city')
      .eq('user_id', userId)
      .in('status', ['VISITED', 'ATTENDED'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (!data || data.length === 0) {
      await sendMessage(chatId, '📍 No visited places yet!')
      return
    }
    const list = data.map((j, i) =>
      `${i + 1}. <b>${j.name}</b> ${j.rating ? '⭐'.repeat(Math.round(j.rating)) : ''}${j.city ? ` · ${j.city}` : ''}`
    ).join('\n')
    await sendMessage(chatId, `✅ <b>Visited (${data.length})</b>\n\n${list}`)
    return
  }

  if (command === '/toprated') {
    const { data } = await admin
      .from('family_journals')
      .select('name, rating, city, family_verdict')
      .eq('user_id', userId)
      .not('rating', 'is', null)
      .order('rating', { ascending: false })
      .limit(10)

    if (!data || data.length === 0) {
      await sendMessage(chatId, '⭐ No rated entries yet!')
      return
    }
    const list = data.map((j, i) =>
      `${i + 1}. <b>${j.name}</b> — ${'⭐'.repeat(Math.round(j.rating || 0))}${j.city ? ` (${j.city})` : ''}`
    ).join('\n')
    await sendMessage(chatId, `🏆 <b>Top Rated (${data.length})</b>\n\n${list}`)
    return
  }

  if (command === '/random') {
    const { data } = await admin
      .from('family_journals')
      .select('name, type, category, city, status, family_verdict, notes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!data || data.length === 0) {
      await sendMessage(chatId, '📔 No journal entries yet!')
      return
    }
    const random = data[Math.floor(Math.random() * data.length)]
    await sendMessage(chatId,
      `🎲 <b>Random Suggestion:</b>\n\n<b>${random.name}</b>\nType: ${random.type}\nStatus: ${random.status}${random.city ? `\nCity: ${random.city}` : ''}${random.family_verdict ? `\nVerdict: ${random.family_verdict}` : ''}${random.notes ? `\n\n💬 ${random.notes.slice(0, 100)}${random.notes.length > 100 ? '...' : ''}` : ''}`
    )
    return
  }

  if (command === '/search') {
    const query = text.split(' ').slice(1).join(' ')
    if (!query) {
      await sendMessage(chatId, '🔍 Usage: /search <name>\n\nExample: /search sate khas senayan')
      return
    }
    const { data } = await admin
      .from('family_journals')
      .select('name, type, status, city, rating')
      .eq('user_id', userId)
      .ilike('name', `%${query}%`)
      .limit(10)

    if (!data || data.length === 0) {
      await sendMessage(chatId, `🔍 No results for "<b>${query}</b>"`)
      return
    }
    const list = data.map((j, i) =>
      `${i + 1}. <b>${j.name}</b> [${j.status}]${j.city ? ` · ${j.city}` : ''}${j.rating ? ` ⭐${j.rating}` : ''}`
    ).join('\n')
    await sendMessage(chatId, `🔍 Results for "<b>${query}</b>":\n\n${list}`)
    return
  }

  if (command === '/add_place') {
    conversationState.set(chatId, { step: 'place_name', type: 'PLACE', data: { user_id: userId, type: 'PLACE', source: 'TELEGRAM' } })
    await removeKeyboard(chatId, '📍 <b>Add New Place</b>\n\nStep 1/12 — What is the name of the place?')
    return
  }

  if (command === '/add_event') {
    conversationState.set(chatId, { step: 'event_name', type: 'EVENT', data: { user_id: userId, type: 'EVENT', source: 'TELEGRAM' } })
    await removeKeyboard(chatId, '🎉 <b>Add New Event</b>\n\nStep 1/12 — What is the event name?')
    return
  }

  await sendMessage(chatId, 'Unknown command. Use /help to see available commands.')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleConversation(chatId: number, text: string, userId: string | null) {
  const admin = createSupabaseAdminClient()
  const state = conversationState.get(chatId)
  if (!state) return false

  const PLACE_CATEGORIES = ['Restaurant', 'Cafe', 'Kids Playground', 'Tourist Attraction', 'Mall', 'Hotel', 'Outdoor', 'Other']
  const EVENT_CATEGORIES = ['Kids Event', 'Family Event', 'Bazaar', 'Exhibition', 'Concert', 'Workshop', 'School Event', 'Mall Event', 'Festival', 'Other']
  const VERDICTS = ['MUST TRY', 'WORTH IT', 'BIASA AJA', 'SKIP', 'COMEBACK', 'Skip']
  const PLACE_STATUSES = ['WISHLIST', 'VISITED', 'CANCELLED']
  const EVENT_STATUSES = ['WISHLIST', 'UPCOMING', 'ATTENDED', 'CANCELLED']
  const skip = text.toLowerCase() === 'skip' || text === '-'

  // PLACE flow
  const placeSteps: Record<string, { next: string; key: string; msg: string; buttons?: string[][] }> = {
    place_name: { next: 'place_category', key: 'name', msg: 'Category?', buttons: [PLACE_CATEGORIES.slice(0, 4), PLACE_CATEGORIES.slice(4)] },
    place_category: { next: 'place_city', key: 'category', msg: 'City? (or "skip")' },
    place_city: { next: 'place_address', key: 'city', msg: 'Address? (or "skip")' },
    place_address: { next: 'place_maps', key: 'address', msg: 'Google Maps URL? (or "skip")' },
    place_maps: { next: 'place_status', key: 'google_maps_url', msg: 'Status?', buttons: [PLACE_STATUSES] },
    place_status: { next: 'place_date', key: 'status', msg: 'Visit date? (YYYY-MM-DD, or "skip")' },
    place_date: { next: 'place_rating', key: 'visit_date', msg: 'Rating? (1-5, or "skip")', buttons: [['1','2','3','4','5','Skip']] },
    place_rating: { next: 'place_kid', key: 'rating', msg: 'Kid friendly?', buttons: [['Yes', 'No']] },
    place_kid: { next: 'place_budget', key: 'kid_friendly', msg: 'Budget estimate in IDR? (or "skip")' },
    place_budget: { next: 'place_verdict', key: 'budget_estimate', msg: 'Family verdict?', buttons: [VERDICTS.slice(0, 3), VERDICTS.slice(3)] },
    place_verdict: { next: 'place_notes', key: 'family_verdict', msg: 'Any notes? (or "skip")' },
    place_notes: { next: 'done', key: 'notes', msg: '' },
  }

  // EVENT flow
  const eventSteps: Record<string, { next: string; key: string; msg: string; buttons?: string[][] }> = {
    event_name: { next: 'event_category', key: 'name', msg: 'Category?', buttons: [EVENT_CATEGORIES.slice(0, 4), EVENT_CATEGORIES.slice(4)] },
    event_category: { next: 'event_location', key: 'category', msg: 'Location/Venue name? (or "skip")' },
    event_location: { next: 'event_city', key: 'location_name', msg: 'City? (or "skip")' },
    event_city: { next: 'event_start', key: 'city', msg: 'Start date? (YYYY-MM-DD, or "skip")' },
    event_start: { next: 'event_end', key: 'event_start_date', msg: 'End date? (YYYY-MM-DD, or "skip")' },
    event_end: { next: 'event_time', key: 'event_end_date', msg: 'Event time? (HH:MM, or "skip")' },
    event_time: { next: 'event_ticket', key: 'event_time', msg: 'Ticket price in IDR? (0 for free, or "skip")' },
    event_ticket: { next: 'event_maps', key: 'ticket_price', msg: 'Google Maps URL? (or "skip")' },
    event_maps: { next: 'event_status', key: 'google_maps_url', msg: 'Status?', buttons: [EVENT_STATUSES] },
    event_status: { next: 'event_rating', key: 'status', msg: 'Rating? (1-5, or "skip")', buttons: [['1','2','3','4','5','Skip']] },
    event_rating: { next: 'event_kid', key: 'rating', msg: 'Kid friendly?', buttons: [['Yes', 'No']] },
    event_kid: { next: 'event_verdict', key: 'kid_friendly', msg: 'Family verdict?', buttons: [VERDICTS.slice(0, 3), VERDICTS.slice(3)] },
    event_verdict: { next: 'event_notes', key: 'family_verdict', msg: 'Any notes? (or "skip")' },
    event_notes: { next: 'done', key: 'notes', msg: '' },
  }

  const steps = state.type === 'PLACE' ? placeSteps : eventSteps
  const currentStep = steps[state.step]
  if (!currentStep) return false

  // Parse value
  let value: unknown = skip ? null : text.trim()
  if (!skip) {
    if (currentStep.key === 'rating') value = parseFloat(text) || null
    if (currentStep.key === 'ticket_price' || currentStep.key === 'budget_estimate') value = parseFloat(text) || null
    if (currentStep.key === 'kid_friendly') value = text.toLowerCase() === 'yes'
    if (currentStep.key === 'family_verdict') value = text === 'Skip' ? null : text.toUpperCase()
    if (currentStep.key === 'status') value = text.toUpperCase()
  }

  // Update state
  if (value !== null) {
    state.data[currentStep.key] = value
  }
  state.step = currentStep.next

  if (currentStep.next === 'done') {
    // Save to DB
    conversationState.delete(chatId)
    const { error } = await admin.from('family_journals').insert({
      ...state.data,
      kid_friendly: state.data.kid_friendly ?? false,
    })
    if (error) {
      await removeKeyboard(chatId, `❌ Failed to save: ${error.message}`)
    } else {
      await removeKeyboard(chatId,
        `✅ <b>${state.data.name}</b> saved successfully!\n\n🌐 View it on the Family Journal web app.`
      )
    }
    return true
  }

  const nextStep = steps[currentStep.next]
  if (nextStep?.buttons) {
    await sendReplyKeyboard(chatId, nextStep.msg, nextStep.buttons)
  } else {
    await removeKeyboard(chatId, nextStep?.msg || 'Next...')
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-telegram-bot-api-secret-token')
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const message = body.message || body.edited_message
    if (!message) return NextResponse.json({ ok: true })

    const chatId: number = message.chat.id
    const text: string = message.text || ''
    const from = message.from

    if (!text) return NextResponse.json({ ok: true })

    // Check if in conversation
    if (conversationState.has(chatId) && !text.startsWith('/')) {
      const linkedUser = await getLinkedUser(String(from.id))
      await handleConversation(chatId, text, linkedUser?.user_id || null)
      return NextResponse.json({ ok: true })
    }

    // Handle commands
    await handleCommand(chatId, text, from)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}
