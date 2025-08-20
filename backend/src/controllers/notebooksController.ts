import { Request, Response } from 'express'
import { ApiList } from '../models/types'
import { NotebookModel } from '../models/Notebook'

export function listNotebooks(_req: Request, res: Response) {
  void NotebookModel.find().sort({ createdAt: -1 }).then((docs) => {
    const items = docs.map((d) => ({
      id: d._id.toString(),
      title: d.title,
      createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    }))
    const payload: ApiList<typeof items[number]> = { items }
    res.json(payload)
  })
}

export function getNotebook(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  void NotebookModel.findById(id).then((doc) => {
    if (!doc) return res.status(404).json({ message: 'Notebook not found' })
    return res.json({
      id: doc._id.toString(),
      title: doc.title,
      createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    })
  })
}

export function createNotebookHandler(req: Request, res: Response) {
  const { title } = req.body ?? {}
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'title is required' })
  }
  void NotebookModel.create({ title }).then((doc) => {
    return res.status(201).json({
      id: doc._id.toString(),
      title: doc.title,
      createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    })
  })
}

export function updateNotebookHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  const { title } = req.body ?? {}
  void NotebookModel.findByIdAndUpdate(id, { title }, { new: true }).then((doc) => {
    if (!doc) return res.status(404).json({ message: 'Notebook not found' })
    return res.json({
      id: doc._id.toString(),
      title: doc.title,
      createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    })
  })
}

export function deleteNotebookHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' })
  }
  void NotebookModel.findByIdAndDelete(id).then((doc) => {
    if (!doc) return res.status(404).json({ message: 'Notebook not found' })
    return res.status(204).send()
  })
}


