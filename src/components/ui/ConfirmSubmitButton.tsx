'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = {
  confirmMessage: string
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'>

/** Submit button that runs `confirm()` before allowing the form to submit. Use inside `<form action={serverAction}>`. */
export function ConfirmSubmitButton({ confirmMessage, children, ...props }: Props) {
  return (
    <button
      type="submit"
      {...props}
      onClick={e => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
