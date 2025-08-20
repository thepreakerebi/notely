export type ID = string

export interface Notebook {
  id: ID
  title: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: ID
  notebookId: ID
  title: string
  // BlockNote JSON content
  content: unknown
  createdAt: string
  updatedAt: string
}

export interface ApiList<T> {
  items: T[]
}


