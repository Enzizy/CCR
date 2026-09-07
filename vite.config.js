import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { publicConfig } from './scripts/public-config.js'

function ccrApiPlugin() {
  return {
    name: 'ccr-api-server',
    async configureServer(server) {
      const { default: express } = await import('express')
      const { initDb } = await import('./server/db.js')
      const { apiRouter } = await import('./server/api.js')
      initDb()
      const app = express()
      app.use('/api', apiRouter)
      server.middlewares.use(app)
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  const config = publicConfig(env, command === 'build')
  return {
    plugins: [vue(), ...(command === 'serve' && !config.key ? [ccrApiPlugin()] : [])],
    // Explicitly expose only validated public credentials, never the full environment.
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(config.url),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(config.key),
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: { port: 5173, host: true },
  }
})

