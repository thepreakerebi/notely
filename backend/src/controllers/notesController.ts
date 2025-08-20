import { Request, Response } from 'express'
import { ApiList } from '../models/types'
import { store, createNote, updateNote, deleteNote } from '../models/store'

export function listNotes(req: Request, res: Response) {
  const { notebookId } = req.query
  let items = Array.from(store.notes.values())
  if (typeof notebookId === 'string') {
    items = items.filter((n) => n.notebookId === notebookId)
  }
  const payload: ApiList<typeof items[number]> = { items }
  res.json(payload)
}

export function getNote(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  const note = store.notes.get(id)
  if (!note) return res.status(404).json({ message: 'Note not found' })
  res.json(note)
}

export function createNoteHandler(req: Request, res: Response) {
  const { notebookId, title, content } = req.body ?? {}
  if (!notebookId || typeof notebookId !== 'string') {
    return res.status(400).json({ message: 'notebookId is required' })
  }
  if (!store.notebooks.has(notebookId)) {
    return res.status(400).json({ message: 'notebookId does not exist' })
  }
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'title is required' })
  }
  const note = createNote({ notebookId, title, content })
  res.status(201).json(note)
}

export function updateNoteHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  const { title, content, notebookId } = req.body ?? {}
  if (notebookId && !store.notebooks.has(notebookId)) {
    return res.status(400).json({ message: 'notebookId does not exist' })
  }
  const updated = updateNote(id, { title, content, notebookId })
  if (!updated) return res.status(404).json({ message: 'Note not found' })
  res.json(updated)
}

export function deleteNoteHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  const ok = deleteNote(id)
  if (!ok) return res.status(404).json({ message: 'Note not found' })
  res.status(204).send()
}


