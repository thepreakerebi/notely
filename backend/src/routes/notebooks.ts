import { Router } from 'express'
import {
  listNotebooks,
  getNotebook,
  createNotebookHandler,
  updateNotebookHandler,
  deleteNotebookHandler,
} from '../controllers/notebooksController'

export const notebooksRouter = Router()

notebooksRouter.get('/', listNotebooks)
notebooksRouter.get('/:id', getNotebook)
notebooksRouter.post('/', createNotebookHandler)
notebooksRouter.patch('/:id', updateNotebookHandler)
notebooksRouter.delete('/:id', deleteNotebookHandler)


