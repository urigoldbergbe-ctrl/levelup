'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { rerunCurriculumFromProgressAction } from '@/features/assessment/actions'

type Status = 'running' | 'done' | 'error'

export default function JourneyAutoRegen() {
  const router = useRouter()
  const ran = useRef(false)
  const [status, setStatus] = useState<Status>('running')

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    rerunCurriculumFromProgressAction()
      .then((res) => {
        if (res.ok) {
          setStatus('done')
          // Reload page so the freshly generated curriculum is displayed
          router.refresh()
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [router])

  if (status === 'done') return null

  return (
    <div
      className="mb-6 flex items-center gap-3 border-l-4 border-mckinsey-blue bg-mckinsey-light px-4 py-3 text-sm font-body text-ink-mid"
      style={{ borderRadius: '2px' }}
    >
      {status === 'running' ? (
        <>
          <span
            className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-mckinsey-light border-t-mckinsey-blue animate-spin"
          />
          Personalising your journey with recent changes&hellip;
        </>
      ) : (
        <>
          <span className="text-red-500">⚠</span>
          Could not refresh journey — your previous content is shown.
        </>
      )}
    </div>
  )
}
