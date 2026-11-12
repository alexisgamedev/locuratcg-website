import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Logo } from './Logo'

const NAV = [
  { to: '/raffles', label: 'Sorteos' },
  { to: '/membership', label: 'Membresía' },
  { to: '/winners', label: 'Ganadores' },
  { to: '/rules', label: 'Cómo funciona' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
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
              {user?.is_admin && (
                <Link to="/admin" className="text-sm text-primary transition-colors hover:text-foreground">
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Cerrar sesión
              </button>
              <Link
                to="/dashboard"
                className="glow-ion rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Mi cuenta
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Iniciar sesión
              </Link>
              <Link
                to="/membership"
                className="glow-ion rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Únete al club
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir o cerrar menú"
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
            {user?.is_admin && (
              <Link to="/admin" onClick={close} className="rounded-lg px-2 py-3 text-base text-primary">
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  close()
                  logout()
                }}
                className="rounded-lg px-2 py-3 text-left text-base text-muted-foreground"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link to="/login" onClick={close} className="rounded-lg px-2 py-3 text-base text-muted-foreground">
                Iniciar sesión
              </Link>
            )}
          </nav>
          <Link
            to={isAuthenticated ? '/dashboard' : '/membership'}
            onClick={close}
            className="mt-3 block rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            {isAuthenticated ? 'Mi cuenta' : 'Únete al club'}
          </Link>
        </div>
      )}
    </header>
  )
}
