import { Link } from '@tanstack/react-router'
import { Logo } from './Logo'

const COLUMNS = [
  {
    title: 'Club',
    links: [
      { to: '/membership', label: 'Membership' },
      { to: '/raffles', label: 'Live raffles' },
      { to: '/winners', label: 'Winners' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { to: '/rules', label: 'How it works' },
      { to: '/rules', label: 'Club rules' },
      { to: '/raffles', label: 'Prize archive' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Sign in' },
      { to: '/register', label: 'Create account' },
      { to: '/dashboard', label: 'My vault' },
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
              A membership club for TCG collectors. Your plan tops up points every month, and you decide which
              Pokémon and One Piece prizes get your entries.
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
          <p>© {new Date().getFullYear()} Pull Club. No purchase necessary where prohibited by law.</p>
          <p className="font-mono tracking-[0.2em]">18+ · PLAY RESPONSIBLY</p>
        </div>
      </div>
    </footer>
  )
}
