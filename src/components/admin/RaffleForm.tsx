import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PrizeImage } from '@/components/PrizeImage'
import { GAME_LABELS } from '@/lib/games'
import type { Game, Raffle, RaffleInput } from '@/lib/types'
import { saveRaffle, uploadImage } from '@/server/admin-functions'

/** ISO timestamp -> value for <input type="datetime-local"> in the admin's own time zone. */
function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** A week from now at 7pm local time: a sensible default draw date. */
function defaultDrawDate() {
  const d = new Date(Date.now() + 7 * 864e5)
  d.setHours(19, 0, 0, 0)
  return toLocalInput(d.toISOString())
}

const inputClass =
  'mt-2 flex h-11 w-full rounded-md border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function RaffleForm({ raffle, onSaved }: { raffle?: Raffle; onSaved?: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInput = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    game: (raffle?.game ?? 'pokemon') as Game,
    prize_name: raffle?.prize_name ?? '',
    kicker: raffle?.kicker ?? '',
    prize_image: raffle?.prize_image ?? '',
    retail_value: String(raffle?.retail_value ?? ''),
    entry_cost_points: String(raffle?.entry_cost_points ?? '50'),
    entry_goal: String(raffle?.entry_goal ?? '500'),
    draws_at: raffle ? toLocalInput(raffle.draws_at) : defaultDrawDate(),
  })
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const upload = useMutation({
    mutationFn: (file: File) => {
      const data = new FormData()
      data.append('file', file)
      return uploadImage({ data })
    },
    onSuccess: ({ url }) => setForm((f) => ({ ...f, prize_image: url })),
    onError: (e: Error) => toast.error(e.message),
  })

  const save = useMutation({
    mutationFn: (status: 'draft' | 'live') => {
      const input: RaffleInput = {
        id: raffle?.id,
        game: form.game,
        prize_name: form.prize_name,
        kicker: form.kicker,
        prize_image: form.prize_image,
        retail_value: Number(form.retail_value || 0),
        entry_cost_points: Number(form.entry_cost_points),
        entry_goal: Number(form.entry_goal),
        draws_at: form.draws_at ? new Date(form.draws_at).toISOString() : null,
        status,
      }
      return saveRaffle({ data: input })
    },
    onSuccess: ({ id }, status) => {
      toast.success(status === 'live' ? 'Raffle is live.' : 'Saved as draft.')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      if (raffle) onSaved?.()
      else navigate({ to: '/admin/raffles/$raffleId', params: { raffleId: id } })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    save.mutate('live')
  }

  const isLive = raffle?.status === 'live'
  const busy = save.isPending || upload.isPending

  return (
    <form onSubmit={submit} className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
        <div>
          <span className="text-sm font-medium text-foreground">Prize image</span>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="group relative mt-2 block w-full overflow-hidden rounded-xl border border-dashed border-border hover:border-primary/50"
          >
            <PrizeImage src={form.prize_image} alt="Prize" className="aspect-[4/3] w-full" />
            <span className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              {upload.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <ImageUp className="h-4 w-4" /> Upload
                </span>
              )}
            </span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) upload.mutate(file)
              e.target.value = ''
            }}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG or WebP, up to 5 MB. 4:3 looks best.</p>
        </div>

        <div className="space-y-5">
          <Row label="Prize name">
            <input
              className={inputClass}
              value={form.prize_name}
              onChange={set('prize_name')}
              placeholder="Charizard ex — Special Illustration Rare · PSA 10"
              required
            />
          </Row>
          <div className="grid gap-5 sm:grid-cols-2">
            <Row label="Game">
              <select className={inputClass} value={form.game} onChange={set('game')}>
                {Object.entries(GAME_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Label" hint='Small text above the name, e.g. "Grail of the month".'>
              <input className={inputClass} value={form.kicker} onChange={set('kicker')} placeholder="Sealed product" />
            </Row>
          </div>
        </div>
      </div>

      <Row label="Or paste an image link" hint="Uploading replaces this. Leave as is if you uploaded a file.">
        <input
          className={inputClass}
          value={form.prize_image}
          onChange={set('prize_image')}
          placeholder="https://…"
        />
      </Row>

      <div className="grid gap-5 sm:grid-cols-3">
        <Row label="Retail value (USD)">
          <input className={inputClass} type="number" min="0" step="1" value={form.retail_value} onChange={set('retail_value')} />
        </Row>
        <Row label="Points per entry">
          <input
            className={inputClass}
            type="number"
            min="1"
            step="1"
            value={form.entry_cost_points}
            onChange={set('entry_cost_points')}
            required
          />
        </Row>
        <Row label="Entry goal" hint="Only drives the progress bar.">
          <input className={inputClass} type="number" min="1" step="1" value={form.entry_goal} onChange={set('entry_goal')} required />
        </Row>
      </div>

      <Row label="Draw date" hint="Entries close and the winner is drawn automatically at this time (your local time).">
        <input className={inputClass} type="datetime-local" value={form.draws_at} onChange={set('draws_at')} />
      </Row>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        {!isLive && (
          <button
            type="button"
            onClick={() => save.mutate('draft')}
            disabled={busy}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground disabled:opacity-50"
          >
            Save as draft
          </button>
        )}
        {isLive && (
          <button
            type="button"
            onClick={() => save.mutate('draft')}
            disabled={busy}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground disabled:opacity-50"
          >
            Unpublish
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className="glow-ion rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {save.isPending ? 'Saving…' : isLive ? 'Save changes' : 'Publish'}
        </button>
      </div>
    </form>
  )
}
