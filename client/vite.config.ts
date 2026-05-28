import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Mismo puerto que PORT en server/.env (evita 500 text/plain del proxy). */
function getServerPort(): number {
  const envPath = path.resolve(__dirname, '../server/.env')
  try {
    const text = fs.readFileSync(envPath, 'utf8')
    const match = text.match(/^PORT=(\d+)\s*$/m)
    if (match) return parseInt(match[1], 10)
  } catch {
    /* server/.env opcional en CI */
  }
  return 5000
}

const serverPort = getServerPort()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${serverPort}`,
        changeOrigin: true,
      },
    },
  },
})


