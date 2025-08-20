import mongoose, { Schema, InferSchemaType } from 'mongoose'

const NoteSchema = new Schema(
  {
    notebookId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
)

export type NoteDocument = InferSchemaType<typeof NoteSchema> & { _id: string }

export const NoteModel = mongoose.model('Note', NoteSchema)


