import express from 'express'
import cors from 'cors'
import { notesRouter } from './routes/notes'
import { notebooksRouter } from './routes/notebooks'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/notebooks', notebooksRouter)
app.use('/api/notes', notesRouter)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT}`)
})


