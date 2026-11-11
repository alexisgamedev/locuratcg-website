// Production server: serves the built app and shuts down cleanly when the host stops it.
// Railway (and most hosts) send SIGTERM on redeploy; exiting with code 0 marks that as a normal stop
// rather than a crash. Run directly with `node` so the signal reaches this process.
import { preview } from 'vite'

const port = Number(process.env.PORT) || 3000
const server = await preview({ preview: { host: '0.0.0.0', port, strictPort: true } })
server.printUrls()

let stopping = false
function shutdown(signal) {
  if (stopping) return
  stopping = true
  console.log(`${signal} received, shutting down…`)
  // Stop accepting new requests, let in-flight ones finish, then close the database.
  server.httpServer.close(() => {
    try {
      globalThis.__pullClubDb?.close()
    } catch {}
    process.exit(0)
  })
  server.httpServer.closeAllConnections?.()
  // Don't hang forever on a stuck connection.
  setTimeout(() => process.exit(0), 8000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
