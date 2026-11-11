import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Lock, Mail, User, UserPlus } from 'lucide-react'
import { AuthCard, Field, FormError, SubmitButton } from '@/components/AuthCard'
import { safeReturnTo, sessionQuery } from '@/lib/auth'
import { register } from '@/server/functions'

export const Route = createFileRoute('/register')({
  validateSearch: (s: Record<string, unknown>): { returnTo?: string } => ({ returnTo: typeof s.returnTo === 'string' ? s.returnTo : undefined }),
  head: () => ({ meta: [{ title: 'Crear cuenta — Locura TCG' }] }),
  component: RegisterPage,
})

function RegisterPage() {
  const { returnTo } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setBusy(true)
    try {
      const user = await register({ data: { email, password, fullName } })
      queryClient.setQueryData(sessionQuery.queryKey, user)
      navigate({ href: safeReturnTo(returnTo) })
    } catch (err) {
      setError((err as Error).message || 'No se pudo crear la cuenta')
      setBusy(false)
    }
  }

  return (
    <AuthCard icon={UserPlus} title="Crea tu cuenta" subtitle="Regístrate para empezar">
      <FormError>{error}</FormError>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          id="reg-name"
          label="Nombre"
          icon={User}
          autoComplete="name"
          placeholder="Ash Ketchum"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Field
          id="reg-email"
          label="Correo electrónico"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="reg-password"
          label="Contraseña"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Field
          id="reg-confirm"
          label="Confirmar contraseña"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <SubmitButton busy={busy} busyLabel="Creando cuenta...">
          Crear cuenta
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" search={{ returnTo }} className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthCard>
  )
}
