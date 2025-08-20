import { Router } from 'express'
import {
  listDocsHandler,
  getDocHandler,
  createDocHandler,
  updateDocHandler,
  deleteDocHandler,
} from '../controllers/docsController'

export const docsRouter = Router()

docsRouter.get('/', listDocsHandler)
docsRouter.get('/:id', getDocHandler)
docsRouter.post('/', createDocHandler)
docsRouter.patch('/:id', updateDocHandler)
docsRouter.delete('/:id', deleteDocHandler)


