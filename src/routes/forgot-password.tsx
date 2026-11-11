import { useState, type FormEvent } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { KeyRound, Mail } from 'lucide-react'
import { AuthCard, Field, FormError, SubmitButton } from '@/components/AuthCard'
import { requestPasswordReset } from '@/server/functions'

export const Route = createFileRoute('/forgot-password')({
  head: () => ({ meta: [{ title: 'Restablecer contraseña — Locura TCG' }] }),
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await requestPasswordReset({ data: { email } })
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard icon={KeyRound} title="Restablecer contraseña" subtitle="Te enviaremos un enlace para restablecerla">
      {sent ? (
        <p className="text-center text-sm text-foreground">
          Si existe una cuenta con ese correo, en breve recibirás un enlace para restablecer tu contraseña.
        </p>
      ) : (
        <>
          <FormError>{error}</FormError>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              id="forgot-email"
              label="Correo electrónico"
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <SubmitButton busy={busy} busyLabel="Enviando...">
              Enviar enlace
            </SubmitButton>
          </form>
        </>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthCard>
  )
}
