import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { KeyRound, Lock, TriangleAlert } from 'lucide-react'
import { AuthCard, Field, FormError, SubmitButton } from '@/components/AuthCard'
import { resetPassword } from '@/server/functions'

export const Route = createFileRoute('/reset-password')({
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({ token: typeof s.token === 'string' ? s.token : undefined }),
  head: () => ({ meta: [{ title: 'Elige una nueva contraseña — Locura TCG' }] }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!token) {
    return (
      <AuthCard icon={TriangleAlert} title="Enlace no válido" subtitle="Este enlace para restablecer la contraseña falta o no es válido">
        <p className="text-center text-sm text-foreground">
          Parece que el enlace que usaste está incompleto. Solicita un nuevo correo para restablecer tu contraseña.
        </p>
        <p className="mt-6 text-center text-sm">
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Solicitar un nuevo enlace
          </Link>
        </p>
      </AuthCard>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setBusy(true)
    try {
      await resetPassword({ data: { token: token!, password } })
      await queryClient.invalidateQueries()
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError((err as Error).message || 'No se pudo restablecer la contraseña')
      setBusy(false)
    }
  }

  return (
    <AuthCard icon={KeyRound} title="Restablecer contraseña" subtitle="Ingresa tu nueva contraseña">
      <FormError>{error}</FormError>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          id="reset-password"
          label="Nueva contraseña"
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
          id="reset-confirm"
          label="Confirmar contraseña"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <SubmitButton busy={busy} busyLabel="Restableciendo...">
          Restablecer contraseña
        </SubmitButton>
      </form>
    </AuthCard>
  )
}
