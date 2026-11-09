import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { KeyRound, Lock, TriangleAlert } from 'lucide-react'
import { AuthCard, Field, FormError, SubmitButton } from '@/components/AuthCard'
import { resetPassword } from '@/server/functions'

export const Route = createFileRoute('/reset-password')({
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({ token: typeof s.token === 'string' ? s.token : undefined }),
  head: () => ({ meta: [{ title: 'Choose a new password — Pull Club' }] }),
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
      <AuthCard icon={TriangleAlert} title="Invalid reset link" subtitle="This password reset link is missing or invalid">
        <p className="text-center text-sm text-foreground">
          The link you used appears to be incomplete. Please request a new password reset email.
        </p>
        <p className="mt-6 text-center text-sm">
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Request a new link
          </Link>
        </p>
      </AuthCard>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      await resetPassword({ data: { token: token!, password } })
      await queryClient.invalidateQueries()
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password')
      setBusy(false)
    }
  }

  return (
    <AuthCard icon={KeyRound} title="Reset password" subtitle="Enter your new password below">
      <FormError>{error}</FormError>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          id="reset-password"
          label="New password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Field
          id="reset-confirm"
          label="Confirm password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <SubmitButton busy={busy} busyLabel="Resetting...">
          Reset password
        </SubmitButton>
      </form>
    </AuthCard>
  )
}
