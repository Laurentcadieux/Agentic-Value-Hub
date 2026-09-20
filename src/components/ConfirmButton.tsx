'use client'

import { useState } from 'react'

/**
 * A submit button that asks for confirmation before invoking its form
 * action. Used for destructive admin operations (e.g. customer deletion).
 */
export function ConfirmButton({
  label,
  confirm,
  className,
}: {
  label: string
  confirm: string
  className?: string
}) {
  const [pending, setPending] = useState(false)
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirm)) {
          e.preventDefault()
          return
        }
        setPending(true)
      }}
      className={className}
    >
      {pending ? 'Working…' : label}
    </button>
  )
}
