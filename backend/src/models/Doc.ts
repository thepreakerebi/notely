import mongoose, { Schema, InferSchemaType } from 'mongoose'

const DocSchema = new Schema(
  {
    title: { type: String, default: 'New Doc' },
    content: { type: Schema.Types.Mixed, default: null }, // BlockNote JSON
    coverImage: { type: String, default: null }, // URL
    icon: { type: String, default: null }, // emoji or URL
    parentId: { type: Schema.Types.ObjectId, ref: 'Doc', default: null, index: true },
  },
  { timestamps: true }
)

DocSchema.index({ parentId: 1 })

export type DocDocument = InferSchemaType<typeof DocSchema> & { _id: string }

export const DocModel = mongoose.model('Doc', DocSchema)


