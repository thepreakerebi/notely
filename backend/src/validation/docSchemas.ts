import { z } from 'zod'

export const objectIdString = z.string().regex(/^[a-fA-F0-9]{24}$/).brand<'ObjectIdString'>()

export const createDocSchema = z.object({
  title: z.string().optional(),
  content: z.unknown().optional(),
  coverImage: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  parentId: objectIdString.nullable().optional(),
})

export const updateDocSchema = z.object({
  title: z.string().optional(),
  content: z.unknown().optional(),
  coverImage: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  parentId: objectIdString.nullable().optional(),
})


