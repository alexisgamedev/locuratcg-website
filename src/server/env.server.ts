import fs from 'node:fs'

// Load .env into process.env for server code (Node 20.12+). Real environment variables win.
if (fs.existsSync('.env')) process.loadEnvFile('.env')
