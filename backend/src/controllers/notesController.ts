import { Request, Response } from 'express'
import { ApiList } from '../models/types'
import { NoteModel } from '../models/Note'
import { NotebookModel } from '../models/Notebook'

export function listNotes(req: Request, res: Response) {
  const { notebookId } = req.query
  const filter = typeof notebookId === 'string' ? { notebookId } : {}
  void NoteModel.find(filter).sort({ createdAt: -1 }).then((docs) => {
    const items = docs.map((d) => ({
      id: d._id.toString(),
      notebookId: d.notebookId,
      title: d.title,
      content: d.content,
      createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    }))
    const payload: ApiList<typeof items[number]> = { items }
    res.json(payload)
  })
}

export function getNote(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  void NoteModel.findById(id).then((doc) => {
    if (!doc) return res.status(404).json({ message: 'Note not found' })
    return res.json({
      id: doc._id.toString(),
      notebookId: doc.notebookId,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    })
  })
}

export function createNoteHandler(req: Request, res: Response) {
  const { notebookId, title, content } = req.body ?? {}
  if (!notebookId || typeof notebookId !== 'string') {
    return res.status(400).json({ message: 'notebookId is required' })
  }
  // validate target notebook exists
  void NotebookModel.exists({ _id: notebookId }).then((exists) => {
    if (!exists) {
      return res.status(400).json({ message: 'notebookId does not exist' })
    }
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title is required' })
    }
    return NoteModel.create({ notebookId, title, content }).then((doc) =>
      res.status(201).json({
        id: doc._id.toString(),
        notebookId: doc.notebookId,
        title: doc.title,
        content: doc.content,
        createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
        updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
      })
    )
  })
}

export function updateNoteHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  const { title, content, notebookId } = req.body ?? {}
  const checkNotebook = notebookId
    ? NotebookModel.exists({ _id: notebookId }).then((exists) => !!exists)
    : Promise.resolve(true)
  void checkNotebook.then((ok) => {
    if (!ok) return res.status(400).json({ message: 'notebookId does not exist' })
    return NoteModel.findByIdAndUpdate(
      id,
      { title, content, notebookId },
      { new: true }
    ).then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Note not found' })
      return res.json({
        id: doc._id.toString(),
        notebookId: doc.notebookId,
        title: doc.title,
        content: doc.content,
        createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
        updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
      })
    })
  })
}

export function deleteNoteHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  void NoteModel.findByIdAndDelete(id).then((doc) => {
    if (!doc) return res.status(404).json({ message: 'Note not found' })
    return res.status(204).send()
  })
}


