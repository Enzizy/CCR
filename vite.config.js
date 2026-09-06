import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import express from 'express'
import { initDb } from './server/db.js'
import { apiRouter } from './server/api.js'

function ccrApiPlugin() {
  return {
    name: 'ccr-api-server',
    configureServer(server) {
      initDb()
      const app = express()
      app.use('/api', apiRouter)
      server.middlewares.use(app)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), ccrApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})

