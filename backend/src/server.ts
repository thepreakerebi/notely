import express from 'express'
import cors from 'cors'
import { notesRouter, notebooksRouter } from './routes'
import { connectToDatabase } from './config/db'
import { env } from './config/env'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/notebooks', notebooksRouter)
app.use('/api/notes', notesRouter)

async function start() {
  try {
    await connectToDatabase()
    console.log('Connected to database')
    const port = env.port
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${port}`)
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

void start()


