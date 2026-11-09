import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Logo } from './Logo'

const NAV = [
  { to: '/raffles', label: 'Raffles' },
  { to: '/membership', label: 'Membership' },
  { to: '/winners', label: 'Winners' },
  { to: '/rules', label: 'How it works' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: 'text-foreground' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
              <Link
                to="/dashboard"
                className="glow-ion rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                My vault
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Sign in
              </Link>
              <Link
                to="/membership"
                className="glow-ion rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Join the club
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-lg border border-border text-foreground md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background px-5 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} onClick={close} className="rounded-lg px-2 py-3 text-base text-foreground/90">
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  close()
                  logout()
                }}
                className="rounded-lg px-2 py-3 text-left text-base text-muted-foreground"
              >
                Sign out
              </button>
            ) : (
              <Link to="/login" onClick={close} className="rounded-lg px-2 py-3 text-base text-muted-foreground">
                Sign in
              </Link>
            )}
          </nav>
          <Link
            to={isAuthenticated ? '/dashboard' : '/membership'}
            onClick={close}
            className="mt-3 block rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            {isAuthenticated ? 'My vault' : 'Join the club'}
          </Link>
        </div>
      )}
    </header>
  )
}
