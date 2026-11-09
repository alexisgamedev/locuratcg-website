import { useState } from 'react'
import { cn } from '@/lib/utils'

/** Cover-fit image with a neutral placeholder if the URL is missing or fails. */
export function PrizeImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className={cn('relative block overflow-hidden bg-secondary', className)}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/10 via-secondary to-holo/10">
          <span className="serial">No image</span>
        </span>
      )}
    </span>
  )
}
