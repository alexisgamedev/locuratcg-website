import type { ComponentType, InputHTMLAttributes, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

/** Centered card used by login, register and password pages. */
export function AuthCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute inset-0 halo-grid opacity-50" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 block text-center font-display text-[13px] tracking-[0.22em]">
          LOCURA TCG
        </Link>
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Icon className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">{children}</div>
      </div>
    </div>
  )
}

export function Field({
  id,
  label,
  icon: Icon,
  aside,
  ...input
}: {
  id: string
  label: string
  icon?: ComponentType<{ className?: string }>
  aside?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium leading-none">
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          id={id}
          {...input}
          className={`flex h-12 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${Icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  )
}

export function SubmitButton({ busy, busyLabel, children }: { busy: boolean; busyLabel: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {busy ? busyLabel : children}
    </button>
  )
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{children}</div>
}
