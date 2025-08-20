import { Request, Response } from 'express'
import { createDoc, deleteDocCascade, getDoc, listDocs, updateDoc } from '../services/docService'
import { uploadImage } from '../services/cloudinaryService'
import { extractAssets, uploadDataUrlsAndAnnotate } from '../services/contentAssets'
import { createDocSchema, updateDocSchema } from '../validation/docSchemas'
import { Types } from 'mongoose'
import { DocModel } from '../models/Doc'

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
  const parse = createDocSchema.safeParse(req.body ?? {})
  if (!parse.success) return res.status(400).json({ message: 'Invalid body', issues: parse.error.issues })
  const { title, content, coverImage, icon, parentId } = parse.data
  const normalizedTitle = typeof title === 'string' ? title : ''
  void (async () => {
    // parentId validation
    if (parentId) {
      const exists = await DocModel.exists({ _id: new Types.ObjectId(parentId) })
      if (!exists) return res.status(400).json({ message: 'parentId not found' })
    }
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

    const processed = await uploadDataUrlsAndAnnotate(content)
    const doc = await createDoc({
      title: normalizedTitle,
      content: processed.content,
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
  const parse = updateDocSchema.safeParse(req.body ?? {})
  if (!parse.success) return res.status(400).json({ message: 'Invalid body', issues: parse.error.issues })
  const { title, content, coverImage, icon, parentId } = parse.data
  void (async () => {
    // Prevent cycles: parentId cannot be this doc or any of its descendants
    if (parentId) {
      if (parentId === id) return res.status(400).json({ message: 'parentId cannot be self' })
      const descendantIds = await collectDescendantIds(id)
      if (descendantIds.has(parentId)) return res.status(400).json({ message: 'parentId cannot be a descendant' })
      const exists = await DocModel.exists({ _id: new Types.ObjectId(parentId) })
      if (!exists) return res.status(400).json({ message: 'parentId not found' })
    }
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

    // If replacing assets, we should delete old ones
    let old: any = null
    if (coverPublicId || iconPublicId) {
      old = await DocModel.findById(id)
    }
    let newContent = content
    let newContentAssets: ReturnType<typeof extractAssets> = []
    if (content !== undefined) {
      const processed = await uploadDataUrlsAndAnnotate(content)
      newContent = processed.content
      newContentAssets = processed.assets
    }
    const doc = await updateDoc(id, { title, content: newContent, coverImage: coverUrl, coverImagePublicId: coverPublicId, icon: iconUrl, iconPublicId, parentId })
    if (!doc) return res.status(404).json({ message: 'Doc not found' })
    if (old) {
      if (coverPublicId && old.coverImagePublicId && old.coverImagePublicId !== coverPublicId) {
        // Best-effort cleanup
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        import('../services/cloudinaryService').then(({ deleteAsset }) => deleteAsset(old.coverImagePublicId))
      }
      if (iconPublicId && old.iconPublicId && old.iconPublicId !== iconPublicId) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        import('../services/cloudinaryService').then(({ deleteAsset }) => deleteAsset(old.iconPublicId))
      }
    }
    // If content changed, try to remove assets no longer referenced (best effort)
    if (content !== undefined && old?.content) {
      const oldAssets = extractAssets(old.content)
      const newSet = new Set(newContentAssets.map((a) => a.publicId))
      const toRemove = oldAssets.filter((a) => !newSet.has(a.publicId))
      for (const a of toRemove) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        import('../services/cloudinaryService').then(({ deleteAssetGeneric }) => deleteAssetGeneric(a.publicId, a.resourceType))
      }
    }
    return res.json(doc)
  })()
}

async function collectDescendantIds(rootId: string): Promise<Set<string>> {
  const seen = new Set<string>()
  const stack = [rootId]
  while (stack.length) {
    const current = stack.pop() as string
    const children = await DocModel.find({ parentId: new Types.ObjectId(current) }, { _id: 1 })
    for (const c of children) {
      const id = c._id.toString()
      if (!seen.has(id)) {
        seen.add(id)
        stack.push(id)
      }
    }
  }
  return seen
}

export function deleteDocHandler(req: Request, res: Response) {
  const id = req.params?.id
  if (typeof id !== 'string' || !id) return res.status(400).json({ message: 'id is required' })
  void deleteDocCascade(id).then(() => res.status(204).send())
}


