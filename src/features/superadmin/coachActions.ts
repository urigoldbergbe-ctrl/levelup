'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

async function assertSuperAdmin() {
  const user = await getUser()
  if (!user) redirect('/login')
  const admin = getSupabaseAdminClient()
  const { data } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!data?.is_admin) redirect('/home')
  return user
}

function normalizeCalendlyUrl(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  if (!/^https?:\/\//i.test(t)) return `https://${t}`
  return t
}

export async function createCoachAction(formData: FormData) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim() || null
  const bio = String(formData.get('bio') ?? '').trim() || null
  const calendly_url = normalizeCalendlyUrl(String(formData.get('calendly_url') ?? ''))
  const photo_url = String(formData.get('photo_url') ?? '').trim() || null
  const active = String(formData.get('active') ?? 'true') === 'true'

  if (!name || !email || !calendly_url) {
    throw new Error('Name, email, and Calendly URL are required.')
  }

  const { error } = await admin.from('coaches').insert({
    name,
    email,
    phone,
    bio,
    calendly_url,
    photo_url,
    active,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/superadmin/coaches')
  redirect('/superadmin/coaches')
}

export async function updateCoachAction(coachId: string, formData: FormData) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim() || null
  const bio = String(formData.get('bio') ?? '').trim() || null
  const calendly_url = normalizeCalendlyUrl(String(formData.get('calendly_url') ?? ''))
  const photo_url = String(formData.get('photo_url') ?? '').trim() || null
  const active = String(formData.get('active') ?? 'true') === 'true'

  if (!name || !email || !calendly_url) {
    throw new Error('Name, email, and Calendly URL are required.')
  }

  const { error } = await admin
    .from('coaches')
    .update({
      name,
      email,
      phone,
      bio,
      calendly_url,
      photo_url,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', coachId)

  if (error) throw new Error(error.message)
  revalidatePath('/superadmin/coaches')
  revalidatePath(`/superadmin/coaches/${coachId}/edit`)
}

export async function deleteCoachAction(coachId: string) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()
  const { error } = await admin.from('coaches').delete().eq('id', coachId)
  if (error) throw new Error(error.message)
  revalidatePath('/superadmin/coaches')
}

export async function assignUserCoachAction(userId: string, formData: FormData) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()
  const raw = String(formData.get('coach_id') ?? '').trim()
  const coach_id = raw === '' ? null : raw

  if (coach_id) {
    const { data: c } = await admin.from('coaches').select('id').eq('id', coach_id).maybeSingle()
    if (!c) throw new Error('Invalid coach.')
  }

  if (!coach_id) {
    const { error } = await admin.from('user_coach_assignments').delete().eq('user_id', userId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await admin.from('user_coach_assignments').upsert(
      { user_id: userId, coach_id, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    if (error) throw new Error(error.message)
  }
  revalidatePath('/superadmin/users')
  revalidatePath('/coaching')
  revalidatePath('/journey')
}

export async function recordCoachSessionAction(userId: string, formData: FormData) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()

  const { data: row } = await admin
    .from('user_coach_assignments')
    .select('coach_id')
    .eq('user_id', userId)
    .maybeSingle()

  const coachId = row?.coach_id
  if (!coachId) throw new Error('Assign a coach before logging session tasks.')

  const tasksText = String(formData.get('tasks') ?? '')
  const tasks = tasksText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  const notes = String(formData.get('notes') ?? '').trim() || null

  if (tasks.length === 0 && !notes) {
    throw new Error('Add at least one task line or a note before saving.')
  }

  const { error } = await admin.from('coach_sessions').insert({
    user_id: userId,
    coach_id: coachId,
    tasks,
    notes,
    session_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/superadmin/users')
  revalidatePath('/coaching')
}
