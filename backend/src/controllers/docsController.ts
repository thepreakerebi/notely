import { Request, Response } from 'express'
import { createDoc, deleteDocCascade, getDoc, listDocs, updateDoc } from '../services/docService'

export function listDocsHandler(req: Request, res: Response) {
  const parentId = typeof req.query.parentId === 'string' ? req.query.parentId : undefined
  void listDocs(parentId).then((items) => res.json({ items }))
}

export function getDocHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) return res.status(400).json({ message: 'id is required' })
  void getDoc(id).then((doc) => {
    if (!doc) return res.status(404).json({ message: 'Doc not found' })
    return res.json(doc)
  })
}

export function createDocHandler(req: Request, res: Response) {
  const { title, content, coverImage, icon, parentId } = req.body ?? {}
  const normalizedTitle = typeof title === 'string' ? title : ''
  void createDoc({ title: normalizedTitle, content, coverImage, icon, parentId }).then((doc) =>
    res.status(201).json(doc)
  )
}

export function updateDocHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) return res.status(400).json({ message: 'id is required' })
  const { title, content, coverImage, icon, parentId } = req.body ?? {}
  void updateDoc(id, { title, content, coverImage, icon, parentId }).then((doc) => {
    if (!doc) return res.status(404).json({ message: 'Doc not found' })
    return res.json(doc)
  })
}

export function deleteDocHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) return res.status(400).json({ message: 'id is required' })
  void deleteDocCascade(id).then(() => res.status(204).send())
}


