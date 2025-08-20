import { Request, Response } from 'express'
import { createDoc, deleteDocCascade, getDoc, listDocs, updateDoc } from '../services/docService'
import { uploadImage } from '../services/cloudinaryService'

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
  void (async () => {
    let coverUrl = coverImage ?? null
    let coverPublicId: string | null = null
    let iconUrl = icon ?? null
    let iconPublicId: string | null = null

    if (typeof coverImage === 'string' && coverImage.startsWith('data:')) {
      const up = await uploadImage({ dataUrlOrPath: coverImage, publicIdPrefix: 'cover' })
      coverUrl = up.url
      coverPublicId = up.publicId
    }
    if (typeof icon === 'string' && icon.startsWith('data:')) {
      const up = await uploadImage({ dataUrlOrPath: icon, publicIdPrefix: 'icon' })
      iconUrl = up.url
      iconPublicId = up.publicId
    }

    const doc = await createDoc({
      title: normalizedTitle,
      content,
      coverImage: coverUrl,
      coverImagePublicId: coverPublicId,
      icon: iconUrl,
      iconPublicId: iconPublicId,
      parentId,
    })
    return res.status(201).json(doc)
  })()
}

export function updateDocHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) return res.status(400).json({ message: 'id is required' })
  const { title, content, coverImage, icon, parentId } = req.body ?? {}
  void (async () => {
    let coverUrl = coverImage
    let coverPublicId: string | null | undefined
    let iconUrl = icon
    let iconPublicId: string | null | undefined

    if (typeof coverImage === 'string' && coverImage.startsWith('data:')) {
      const up = await uploadImage({ dataUrlOrPath: coverImage, publicIdPrefix: 'cover' })
      coverUrl = up.url
      coverPublicId = up.publicId
    }
    if (typeof icon === 'string' && icon.startsWith('data:')) {
      const up = await uploadImage({ dataUrlOrPath: icon, publicIdPrefix: 'icon' })
      iconUrl = up.url
      iconPublicId = up.publicId
    }

    const doc = await updateDoc(id, { title, content, coverImage: coverUrl, coverImagePublicId: coverPublicId, icon: iconUrl, iconPublicId, parentId })
    if (!doc) return res.status(404).json({ message: 'Doc not found' })
    return res.json(doc)
  })()
}

export function deleteDocHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) return res.status(400).json({ message: 'id is required' })
  void deleteDocCascade(id).then(() => res.status(204).send())
}


