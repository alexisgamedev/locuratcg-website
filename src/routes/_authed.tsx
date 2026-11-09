import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { SiteLayout } from '@/components/SiteLayout'
import { sessionQuery } from '@/lib/auth'

// Pages under routes/_authed/ require a signed-in user.
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.fetchQuery({ ...sessionQuery, staleTime: 0 })
    if (!user) throw redirect({ to: '/login', search: { returnTo: location.href } })
    return { user }
  },
  component: () => (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  ),
})
