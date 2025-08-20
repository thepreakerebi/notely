import { randomUUID } from 'crypto'
import { Note, Notebook, ID } from './types'

export interface DataStore {
  notebooks: Map<ID, Notebook>
  notes: Map<ID, Note>
}

export const store: DataStore = {
  notebooks: new Map(),
  notes: new Map(),
}

export function createNotebook(title: string): Notebook {
  const now = new Date().toISOString()
  const notebook: Notebook = {
    id: randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
  }
  store.notebooks.set(notebook.id, notebook)
  return notebook
}

export function updateNotebook(id: ID, updates: Partial<Pick<Notebook, 'title'>>): Notebook | undefined {
  const existing = store.notebooks.get(id)
  if (!existing) return undefined
  const updated: Notebook = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  store.notebooks.set(id, updated)
  return updated
}

export function deleteNotebook(id: ID): boolean {
  // cascade delete notes belonging to this notebook
  for (const note of Array.from(store.notes.values())) {
    if (note.notebookId === id) {
      store.notes.delete(note.id)
    }
  }
  return store.notebooks.delete(id)
}

export function createNote(input: { notebookId: ID; title: string; content: unknown }): Note {
  const now = new Date().toISOString()
  const note: Note = {
    id: randomUUID(),
    notebookId: input.notebookId,
    title: input.title,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  }
  store.notes.set(note.id, note)
  return note
}

export function updateNote(id: ID, updates: Partial<Pick<Note, 'title' | 'content' | 'notebookId'>>): Note | undefined {
  const existing = store.notes.get(id)
  if (!existing) return undefined
  const updated: Note = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  store.notes.set(id, updated)
  return updated
}

export function deleteNote(id: ID): boolean {
  return store.notes.delete(id)
}


