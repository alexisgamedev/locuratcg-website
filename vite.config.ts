import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

// Host names the production server answers to: Railway's domains, plus the domain in APP_URL
// (so a custom domain works once you set APP_URL to it).
const allowedHosts = ['.up.railway.app']
try {
  if (process.env.APP_URL) allowedHosts.push(new URL(process.env.APP_URL).hostname)
} catch {
  // APP_URL isn't a valid URL; ignore it.
}

export default defineConfig({
  server: { port: 3000 },
  preview: { allowedHosts },
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), viteReact()],
})
