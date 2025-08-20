import { Router } from 'express'
import {
  listNotes,
  getNote,
  createNoteHandler,
  updateNoteHandler,
  deleteNoteHandler,
} from '../controllers/notesController'

export const notesRouter = Router()

notesRouter.get('/', listNotes)
notesRouter.get('/:id', getNote)
notesRouter.post('/', createNoteHandler)
notesRouter.patch('/:id', updateNoteHandler)
notesRouter.delete('/:id', deleteNoteHandler)


