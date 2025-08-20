import { Types } from 'mongoose'
import { DocModel } from '../models/Doc'

export async function listDocs(parentId?: string) {
  const filter = typeof parentId === 'string' && parentId ? { parentId } : { parentId: null }
  const docs = await DocModel.find(filter).sort({ createdAt: -1 })
  return docs.map((d) => serializeDoc(d))
}

export async function getDoc(id: string) {
  const doc = await DocModel.findById(id)
  return doc ? serializeDoc(doc) : null
}

export async function createDoc(input: {
  title?: string
  content?: unknown
  coverImage?: string | null
  icon?: string | null
  parentId?: string | null
}) {
  const parentObjectId = input.parentId ? new Types.ObjectId(input.parentId) : null
  const doc = await DocModel.create({
    title: input.title ?? '',
    content: input.content ?? null,
    coverImage: input.coverImage ?? null,
    icon: input.icon ?? null,
    parentId: parentObjectId,
  })
  return serializeDoc(doc)
}

export async function updateDoc(id: string, updates: {
  title?: string
  content?: unknown
  coverImage?: string | null
  icon?: string | null
  parentId?: string | null
}) {
  const updatePayload: any = { ...updates }
  if (Object.prototype.hasOwnProperty.call(updates, 'parentId')) {
    updatePayload.parentId = updates.parentId ? new Types.ObjectId(updates.parentId) : null
  }
  const doc = await DocModel.findByIdAndUpdate(id, updatePayload, { new: true })
  return doc ? serializeDoc(doc) : null
}

export async function deleteDocCascade(id: string) {
  // depth-first delete children, then the node
  const stack: string[] = [id]
  const toDelete: string[] = []

  while (stack.length) {
    const current = stack.pop() as string
    toDelete.push(current)
    const children = await DocModel.find({ parentId: current })
    for (const child of children) {
      stack.push(child._id.toString())
    }
  }

  // Delete in reverse (children first), though Mongo won't enforce FK
  await DocModel.deleteMany({ _id: { $in: toDelete } })
  return { count: toDelete.length }
}

function serializeDoc(d: any) {
  return {
    id: d._id.toString(),
    title: d.title as string,
    content: d.content ?? null,
    coverImage: (d.coverImage as string) ?? null,
    icon: (d.icon as string) ?? null,
    parentId: d.parentId ? d.parentId.toString() : null,
    createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: d.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  }
}


