import { Link } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
        <Sparkles className="h-4 w-4 text-primary" />
      </span>
      <span className="font-display text-[13px] leading-none tracking-[0.22em]">PULL CLUB</span>
    </Link>
  )
}
