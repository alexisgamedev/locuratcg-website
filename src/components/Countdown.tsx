import { useEffect, useState } from 'react'

function remaining(target: string | null) {
  if (!target) return null
  const ms = new Date(target).getTime() - Date.now()
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

/** Time left until `target`, ticking every second. Null before hydration and once the time has passed. */
export function useCountdown(target: string | null) {
  const [left, setLeft] = useState<ReturnType<typeof remaining>>(null)

  useEffect(() => {
    setLeft(remaining(target))
    const id = setInterval(() => setLeft(remaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return left
}

export function Countdown({ target, className = '' }: { target: string | null; className?: string }) {
  const left = useCountdown(target)

  if (!left) {
    return <span className={`font-mono text-xs tracking-widest text-muted-foreground ${className}`}>SORTEO MUY PRONTO</span>
  }

  const parts = [
    { v: left.d, l: 'd' },
    { v: left.h, l: 'h' },
    { v: left.m, l: 'm' },
    { v: left.s, l: 's' },
  ]
  return (
    <span className={`font-mono text-xs tracking-widest text-foreground ${className}`}>
      {parts.map((p) => (
        <span key={p.l} className="tabular-nums">
          {String(p.v).padStart(2, '0')}
          <span className="text-muted-foreground">{p.l} </span>
        </span>
      ))}
    </span>
  )
}
