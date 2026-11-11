import { createFileRoute } from '@tanstack/react-router'
import { RaffleForm } from '@/components/admin/RaffleForm'

export const Route = createFileRoute('/admin/raffles/new')({
  component: () => (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
      <p className="serial">Admin</p>
      <h1 className="mt-3 font-display text-3xl text-foreground">New raffle</h1>
      <RaffleForm />
    </div>
  ),
})
