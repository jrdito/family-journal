import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const exportAll = request.nextUrl.searchParams.get('all') === 'true' && isAdmin

    let journals

    if (exportAll) {
      const adminClient = createSupabaseAdminClient()
      const { data } = await adminClient
        .from('family_journals')
        .select('*, profiles(email, display_name, first_name, last_name)')
        .order('created_at', { ascending: false })
      journals = data
    } else {
      const { data } = await supabase
        .from('family_journals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      journals = data
    }

    if (!journals || journals.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 })
    }

    const rows = journals.map((j: {
      name: string
      type: string
      category?: string | null
      city?: string | null
      status: string
      rating?: number | null
      family_verdict?: string | null
      visit_date?: string | null
      event_start_date?: string | null
      kid_friendly: boolean
      budget_estimate?: number | null
      ticket_price?: number | null
      notes?: string | null
      source: string
      created_at: string
      profiles?: { email?: string; display_name?: string; first_name?: string; last_name?: string } | null
    }) => {
      const row: Record<string, string | number | boolean | null | undefined> = {
        Name: j.name,
        Type: j.type,
        Category: j.category || '',
        City: j.city || '',
        Status: j.status,
        Rating: j.rating || '',
        Verdict: j.family_verdict || '',
        Date: j.visit_date || j.event_start_date || '',
        'Kid Friendly': j.kid_friendly ? 'Yes' : 'No',
        Budget: j.budget_estimate || '',
        'Ticket Price': j.ticket_price !== null ? j.ticket_price : '',
        Notes: j.notes || '',
        Source: j.source,
        'Created At': j.created_at,
      }
      if (exportAll && j.profiles) {
        row['User Email'] = j.profiles.email || ''
        row['User Name'] = j.profiles.display_name ||
          `${j.profiles.first_name || ''} ${j.profiles.last_name || ''}`.trim()
      }
      return row
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Family Journal')

    const columns = Object.keys(rows[0]).map(key => ({
      header: key,
      key,
      width: Math.max(key.length, ...rows.map(r => String(r[key] || '').length)) + 2,
    }))
    worksheet.columns = columns
    worksheet.addRows(rows)

    const buffer = await workbook.xlsx.writeBuffer()
    const filename = exportAll
      ? `family-journal-all-${new Date().toISOString().split('T')[0]}.xlsx`
      : `family-journal-${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
