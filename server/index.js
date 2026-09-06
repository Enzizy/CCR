import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db.js'
import { apiRouter } from './api.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Initialize Database
initDb()

// Mount API router
app.use('/api', apiRouter)

// Serve static assets if in production
const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`CCR Business Management System Server running on http://localhost:${PORT}`)
})
