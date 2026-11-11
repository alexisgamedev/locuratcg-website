import { createFileRoute } from '@tanstack/react-router'
import fs from 'node:fs'
import path from 'node:path'
import { UPLOADS_DIR } from '@/server/db.server'

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

// Serves prize images uploaded from the admin area.
export const Route = createFileRoute('/uploads/$file')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const match = /^[a-f0-9]{24}\.(jpg|png|webp|gif)$/.exec(params.file)
        if (!match) return new Response('Not found', { status: 404 })
        const file = path.join(UPLOADS_DIR, params.file)
        if (!fs.existsSync(file)) return new Response('Not found', { status: 404 })
        return new Response(fs.readFileSync(file), {
          headers: {
            'Content-Type': TYPES[match[1]],
            // File names are random and never reused, so they can be cached for good.
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      },
    },
  },
})
