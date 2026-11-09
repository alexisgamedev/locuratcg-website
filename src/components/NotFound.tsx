import { Link } from '@tanstack/react-router'
import { SiteLayout } from './SiteLayout'

export function NotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <p className="serial">404</p>
        <h1 className="mt-3 font-display text-3xl text-foreground">This page isn't in the binder.</h1>
        <p className="mt-3 text-muted-foreground">The link may be old, or the page moved.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground">
          Back home
        </Link>
      </div>
    </SiteLayout>
  )
}
