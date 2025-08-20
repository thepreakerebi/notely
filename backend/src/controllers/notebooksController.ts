import { Request, Response } from 'express'
import { ApiList } from '../models/types'
import { store, createNotebook, updateNotebook, deleteNotebook } from '../models/store'

export function listNotebooks(_req: Request, res: Response) {
  const items = Array.from(store.notebooks.values())
  const payload: ApiList<typeof items[number]> = { items }
  res.json(payload)
}

export function getNotebook(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  const notebook = store.notebooks.get(id)
  if (!notebook) return res.status(404).json({ message: 'Notebook not found' })
  res.json(notebook)
}

export function createNotebookHandler(req: Request, res: Response) {
  const { title } = req.body ?? {}
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'title is required' })
  }
  const notebook = createNotebook(title)
  res.status(201).json(notebook)
}

export function updateNotebookHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  const { title } = req.body ?? {}
  const updated = updateNotebook(id, { title })
  if (!updated) return res.status(404).json({ message: 'Notebook not found' })
  res.json(updated)
}

export function deleteNotebookHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  const ok = deleteNotebook(id)
  if (!ok) return res.status(404).json({ message: 'Notebook not found' })
  res.status(204).send()
}


