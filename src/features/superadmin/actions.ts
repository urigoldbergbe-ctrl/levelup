'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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

// ── Organizations ─────────────────────────────────────────────────────────────

export async function createOrgAction(formData: FormData) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()

  const name = (formData.get('name') as string | null)?.trim()
  if (!name) throw new Error('Organization name is required.')

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { error } = await admin.from('organizations').insert({ name, slug })
  if (error) {
    // Friendly message for duplicate slug
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      throw new Error(`An organization called "${name}" already exists.`)
    }
    throw new Error(error.message)
  }

  revalidatePath('/superadmin/orgs')
}

export async function deleteOrgAction(orgId: string) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()
  await admin.from('organizations').delete().eq('id', orgId)
  revalidatePath('/superadmin/orgs')
  redirect('/superadmin/orgs')
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface InviteUserPayload {
  email: string
  name: string
  orgId: string
  role: 'member' | 'hr_admin' | 'manager' | 'owner'
  /** Optional default password — user will be prompted to change on first login */
  password?: string
}

export async function inviteUserAction(payload: InviteUserPayload) {
  const caller = await assertSuperAdmin()
  const admin = getSupabaseAdminClient()

  const createParams: Parameters<typeof admin.auth.admin.createUser>[0] = {
    email: payload.email,
    user_metadata: { name: payload.name },
    email_confirm: true,
  }
  if (payload.password) {
    createParams.password = payload.password
  }

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser(createParams)

  if (authError && !authError.message.includes('already been registered')) {
    throw new Error(authError.message)
  }

  const userId = authData?.user?.id

  // Ensure profile exists
  if (userId) {
    await admin.from('profiles').upsert(
      { id: userId, name: payload.name },
      { onConflict: 'id' }
    )

    // Add to org
    await admin.from('org_memberships').upsert(
      { org_id: payload.orgId, user_id: userId, role: payload.role },
      { onConflict: 'org_id,user_id' }
    )
  }

  // Track invite
  await admin.from('pending_invites').upsert(
    {
      org_id: payload.orgId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      invited_by: caller.id,
    },
    { onConflict: 'org_id,email' }
  )

  revalidatePath('/superadmin/users')
  revalidatePath(`/superadmin/orgs/${payload.orgId}`)
}

export async function batchInviteAction(rows: InviteUserPayload[]) {
  // Process sequentially to avoid rate limits
  const results: { email: string; ok: boolean; error?: string }[] = []
  for (const row of rows) {
    try {
      await inviteUserAction(row)
      results.push({ email: row.email, ok: true })
    } catch (err) {
      results.push({ email: row.email, ok: false, error: err instanceof Error ? err.message : 'Failed' })
    }
  }
  return results
}

// ── Global Leaders ────────────────────────────────────────────────────────────

export interface GlobalLeaderPayload {
  id?: string
  name: string
  title: string
  company: string
  category: string
  category2?: string | null
  category3?: string | null
  bio: string
  photoUrl: string
}

export async function createGlobalLeaderAction(payload: GlobalLeaderPayload) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()

  const id = payload.id || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { error } = await admin.from('leader_profiles').upsert({
    id,
    name: payload.name,
    title: payload.title,
    company: payload.company,
    category: payload.category,
    category2: payload.category2 || null,
    category3: payload.category3 || null,
    bio: payload.bio || null,
    photo_url: payload.photoUrl || null,
    approved: true,
    is_custom: false,
    org_id: null,
    // Defaults for required fields
    skills: [],
    leader_skill_scores: [],
  }, { onConflict: 'id' })

  if (error) throw new Error(error.message)

  revalidatePath('/superadmin/mentors')
  revalidatePath('/mentors')
  redirect('/superadmin/mentors')
}

export async function updateGlobalLeaderAction(leaderId: string, payload: GlobalLeaderPayload) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()

  const { error } = await admin.from('leader_profiles').update({
    name: payload.name,
    title: payload.title,
    company: payload.company,
    category: payload.category,
    category2: payload.category2 || null,
    category3: payload.category3 || null,
    bio: payload.bio || null,
    photo_url: payload.photoUrl || null,
  }).eq('id', leaderId).eq('is_custom', false)

  if (error) throw new Error(error.message)

  revalidatePath('/superadmin/mentors')
  revalidatePath(`/superadmin/mentors/${leaderId}`)
  revalidatePath('/mentors')
}

// ── News Alerts ───────────────────────────────────────────────────────────────

export interface SendAlertPayload {
  leaderId: string
  orgId: string | null
  subject: string
  body: string
}

export async function sendNewsAlertAction(payload: SendAlertPayload) {
  const caller = await getUser()
  if (!caller) redirect('/login')

  const admin = getSupabaseAdminClient()

  // Find users following this leader
  const query = admin
    .from('profiles')
    .select('id')
    .eq('mentor_id', payload.leaderId)

  if (payload.orgId) {
    const { data: members } = await admin
      .from('org_memberships')
      .select('user_id')
      .eq('org_id', payload.orgId)
    const memberIds = (members ?? []).map(m => m.user_id)
    query.in('id', memberIds)
  }

  const { data: followers } = await query
  const recipientCount = followers?.length ?? 0

  // Get their emails
  let sentCount = 0
  if (recipientCount > 0) {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const followerIds = new Set((followers ?? []).map(f => f.id))
    const recipients = users.filter(u => followerIds.has(u.id) && u.email)

    // Send via Resend if configured, else just log
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && resendKey !== 'placeholder') {
      for (const recipient of recipients) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM ?? 'LevelUp <alerts@levelup.app>',
              to: recipient.email!,
              subject: payload.subject,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
                <h2>${payload.subject}</h2>
                <div style="white-space:pre-line">${payload.body}</div>
                <hr/>
                <p style="color:#888;font-size:12px">You received this because you chose this leader on LevelUp. <a href="#">Unsubscribe</a></p>
              </div>`,
            }),
          })
          sentCount++
        } catch { /* continue */ }
      }
    } else {
      sentCount = recipientCount // Mark as "would send" when no email configured
    }
  }

  // Log the alert
  await admin.from('news_alert_logs').insert({
    leader_id: payload.leaderId,
    org_id: payload.orgId,
    subject: payload.subject,
    body: payload.body,
    sent_by: caller.id,
    recipient_count: sentCount,
  })

  revalidatePath(`/admin/mentors/${payload.leaderId}/catalog`)
  revalidatePath(`/superadmin/mentors/${payload.leaderId}`)
}
