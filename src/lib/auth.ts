import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { getSession, logout as logoutFn } from '@/server/functions'

export const sessionQuery = {
  queryKey: ['auth', 'me'] as const,
  queryFn: () => getSession(),
  staleTime: Infinity,
}

/** Only allow same-site relative paths as a post-login destination. */
export function safeReturnTo(value: unknown) {
  const v = typeof value === 'string' ? value : ''
  if (!v.startsWith('/') || v.startsWith('//') || v.includes('\\')) return '/'
  if (/^\/(login|register|forgot-password|reset-password)(\/|\?|$)/.test(v)) return '/'
  return v
}

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const href = useRouterState({ select: (s) => s.location.href })
  const { data: user, isPending } = useQuery(sessionQuery)

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoadingAuth: isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey }),
    navigateToLogin: () => navigate({ to: '/login', search: { returnTo: href } }),
    logout: async () => {
      await logoutFn()
      queryClient.clear()
      navigate({ to: '/' })
    },
  }
}
