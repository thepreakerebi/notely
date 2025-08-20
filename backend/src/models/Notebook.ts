import mongoose, { Schema, InferSchemaType } from 'mongoose'

const NotebookSchema = new Schema(
  {
    title: { type: String, required: true },
  },
  { timestamps: true }
)

export type NotebookDocument = InferSchemaType<typeof NotebookSchema> & { _id: string }

export const NotebookModel = mongoose.model('Notebook', NotebookSchema)


