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
        draws_at: form.draws_at ? new Date(form.draws_at).toISOString() : null,
        status,
      }
      return saveRaffle({ data: input })
    },
    onSuccess: ({ id }, status) => {
      toast.success(status === 'live' ? 'El sorteo está activo.' : 'Guardado como borrador.')
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
          <span className="text-sm font-medium text-foreground">Imagen del premio</span>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="group relative mt-2 block w-full overflow-hidden rounded-xl border border-dashed border-border hover:border-primary/50"
          >
            <PrizeImage src={form.prize_image} alt="Premio" className="aspect-[4/3] w-full" />
            <span className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              {upload.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <ImageUp className="h-4 w-4" /> Subir
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
          <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG o WebP, hasta 5 MB. En formato 4:3 se ve mejor.</p>
        </div>

        <div className="space-y-5">
          <Row label="Nombre del premio">
            <input
              className={inputClass}
              value={form.prize_name}
              onChange={set('prize_name')}
              placeholder="Charizard ex — Special Illustration Rare · PSA 10"
              required
            />
          </Row>
          <div className="grid gap-5 sm:grid-cols-2">
            <Row label="Juego">
              <select className={inputClass} value={form.game} onChange={set('game')}>
                {Object.entries(GAME_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Etiqueta" hint='Texto pequeño sobre el nombre, p. ej. "Grial del mes".'>
              <input className={inputClass} value={form.kicker} onChange={set('kicker')} placeholder="Producto sellado" />
            </Row>
          </div>
        </div>
      </div>

      <Row label="O pega el enlace de una imagen" hint="Si subes un archivo, reemplaza este enlace. Déjalo como está si ya subiste uno.">
        <input
          className={inputClass}
          value={form.prize_image}
          onChange={set('prize_image')}
          placeholder="https://…"
        />
      </Row>

      <Row label="Valor comercial (USD)">
        <input className={inputClass} type="number" min="0" step="1" value={form.retail_value} onChange={set('retail_value')} />
      </Row>

      <Row label="Fecha del sorteo" hint="A esta hora se sortea automáticamente entre todos los miembros con membresía vigente (tu hora local).">
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
            Guardar como borrador
          </button>
        )}
        {isLive && (
          <button
            type="button"
            onClick={() => save.mutate('draft')}
            disabled={busy}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground disabled:opacity-50"
          >
            Despublicar
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className="glow-ion rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {save.isPending ? 'Guardando…' : isLive ? 'Guardar cambios' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}
