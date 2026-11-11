import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { SiteLayout } from '@/components/SiteLayout'
import { sessionQuery } from '@/lib/auth'

// Everything under /admin. Signed-out visitors go to login; signed-in non-admins see a "no access" page.
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.fetchQuery({ ...sessionQuery, staleTime: 0 })
    if (!user) throw redirect({ to: '/login', search: { returnTo: location.href } })
    return { user }
  },
  head: () => ({ meta: [{ title: 'Admin — Pull Club' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = Route.useRouteContext()

  if (!user.is_admin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <ShieldAlert className="mx-auto h-6 w-6 text-muted-foreground" />
          <h1 className="mt-5 font-display text-2xl text-foreground">Admins only.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {user.email} doesn't have access to the admin area. Add it to the <code>ADMIN_EMAILS</code> variable on
            the server to grant access.
          </p>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <div className="border-b border-border/70 bg-card/40">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3 lg:px-8">
          <span className="serial text-primary">Admin</span>
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: 'text-foreground' }}
          >
            Raffles
          </Link>
          <Link
            to="/admin/raffles/new"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: 'text-foreground' }}
          >
            New raffle
          </Link>
        </div>
      </div>
      <Outlet />
    </SiteLayout>
  )
}
