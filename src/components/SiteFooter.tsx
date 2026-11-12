import { Link } from '@tanstack/react-router'
import { Logo } from './Logo'

const COLUMNS = [
  {
    title: 'Club',
    links: [
      { to: '/membership', label: 'Membresía' },
      { to: '/raffles', label: 'Sorteos activos' },
      { to: '/winners', label: 'Ganadores' },
    ],
  },
  {
    title: 'Infórmate',
    links: [
      { to: '/rules', label: 'Cómo funciona' },
      { to: '/rules', label: 'Reglas del club' },
      { to: '/raffles', label: 'Archivo de premios' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { to: '/login', label: 'Iniciar sesión' },
      { to: '/register', label: 'Crear cuenta' },
      { to: '/dashboard', label: 'Mi cuenta' },
    ],
  },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,0.7fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Un club de membresía para coleccionistas de TCG. Con una sola membresía participas
              automáticamente en todos los sorteos de Pokémon y One Piece.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="serial">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Locura TCG. No se requiere compra donde la ley lo prohíba.</p>
          <p className="font-mono tracking-[0.2em]">18+ · JUEGA CON RESPONSABILIDAD</p>
        </div>
      </div>
    </footer>
  )
}
