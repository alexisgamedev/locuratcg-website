import type { ErrorComponentProps } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'

export function ErrorView({ error }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md text-center">
        <p className="serial">Something broke</p>
        <h1 className="mt-3 font-display text-2xl text-foreground">We couldn't load this page.</h1>
        <p className="mt-3 text-sm text-muted-foreground">{(error as Error)?.message}</p>
        <button
          type="button"
          onClick={() => router.invalidate()}
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
