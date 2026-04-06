'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/supabase/server'

async function assertSuperAdmin() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')
  const admin = getSupabaseAdminClient()
  const { data } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!data?.is_admin) throw new Error('Not authorised')
}

export interface LibraryItemPayload {
  type: 'book' | 'podcast' | 'course'
  title: string
  author?: string
  url?: string
  description?: string
  platform?: string
  gap_tags?: string[]
}

export async function addLibraryItemAction(payload: LibraryItemPayload) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()

  const { error } = await admin.from('global_library').insert({
    type: payload.type,
    title: payload.title,
    author: payload.author || null,
    url: payload.url || null,
    description: payload.description || null,
    platform: payload.platform || null,
    gap_tags: payload.gap_tags ?? [],
  })

  if (error) throw new Error(error.message)
  revalidatePath('/superadmin/library')
}

export async function deleteLibraryItemAction(id: string) {
  await assertSuperAdmin()
  const admin = getSupabaseAdminClient()
  const { error } = await admin.from('global_library').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/superadmin/library')
}

export async function autofillLibraryItemAction(url: string): Promise<Partial<LibraryItemPayload>> {
  await assertSuperAdmin()
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/fetch-metadata?url=${encodeURIComponent(url)}`)
    if (!res.ok) return {}
    const meta = await res.json()
    return {
      title: meta.title ?? '',
      author: meta.author ?? '',
      description: meta.description ?? '',
      platform: meta.siteName ?? '',
      url,
    }
  } catch {
    return {}
  }
}
