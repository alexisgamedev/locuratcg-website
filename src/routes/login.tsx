import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Lock, LogIn, Mail } from 'lucide-react'
import { AuthCard, Field, FormError, SubmitButton } from '@/components/AuthCard'
import { safeReturnTo, sessionQuery } from '@/lib/auth'
import { login } from '@/server/functions'

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>): { returnTo?: string } => ({ returnTo: typeof s.returnTo === 'string' ? s.returnTo : undefined }),
  head: () => ({ meta: [{ title: 'Iniciar sesión — Locura TCG' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { returnTo } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await login({ data: { email, password } })
      queryClient.setQueryData(sessionQuery.queryKey, user)
      navigate({ href: safeReturnTo(returnTo) })
    } catch (err) {
      setError((err as Error).message || 'Correo o contraseña incorrectos')
      setBusy(false)
    }
  }

  return (
    <AuthCard icon={LogIn} title="¡Qué bueno verte de nuevo!" subtitle="Inicia sesión en tu cuenta">
      <FormError>{error}</FormError>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          id="login-email"
          label="Correo electrónico"
          icon={Mail}
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="login-password"
          label="Contraseña"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aside={
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          }
        />
        <SubmitButton busy={busy} busyLabel="Ingresando...">
          Iniciar sesión
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{' '}
        <Link to="/register" search={{ returnTo }} className="font-medium text-primary hover:underline">
          Crea una
        </Link>
      </p>
    </AuthCard>
  )
}
