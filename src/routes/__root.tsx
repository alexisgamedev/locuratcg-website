/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import appCss from '@/styles.css?url'
import { sessionQuery } from '@/lib/auth'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Locura TCG' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  // Load the session up front so server and browser render the same header.
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(sessionQuery)
  },
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster theme="dark" position="bottom-right" richColors />
    </>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="es-PE" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
