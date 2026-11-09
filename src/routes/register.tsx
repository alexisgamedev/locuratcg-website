import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Lock, Mail, User, UserPlus } from 'lucide-react'
import { AuthCard, Field, FormError, SubmitButton } from '@/components/AuthCard'
import { safeReturnTo, sessionQuery } from '@/lib/auth'
import { register } from '@/server/functions'

export const Route = createFileRoute('/register')({
  validateSearch: (s: Record<string, unknown>): { returnTo?: string } => ({ returnTo: typeof s.returnTo === 'string' ? s.returnTo : undefined }),
  head: () => ({ meta: [{ title: 'Create account — Pull Club' }] }),
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
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      const user = await register({ data: { email, password, fullName } })
      queryClient.setQueryData(sessionQuery.queryKey, user)
      navigate({ href: safeReturnTo(returnTo) })
    } catch (err) {
      setError((err as Error).message || 'Registration failed')
      setBusy(false)
    }
  }

  return (
    <AuthCard icon={UserPlus} title="Create your account" subtitle="Sign up to get started">
      <FormError>{error}</FormError>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          id="reg-name"
          label="Name"
          icon={User}
          autoComplete="name"
          placeholder="Ash Ketchum"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Field
          id="reg-email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="reg-password"
          label="Password"
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
          id="reg-confirm"
          label="Confirm password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <SubmitButton busy={busy} busyLabel="Creating account...">
          Create account
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" search={{ returnTo }} className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}
