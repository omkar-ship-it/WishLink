import { useCallback, useState } from 'react'

interface HistoryState<T> {
  present: T
  past: T[]
  future: T[]
}

/** Undo/redo stack with the same set-state signature as useState, so it's a drop-in
 * replacement for existing `setScenes(prev => ...)` call sites. Single state object,
 * no refs — every transition is a pure functional update. */
export function useHistory<T>(initial: T | (() => T)) {
  const [history, setHistory] = useState<HistoryState<T>>(() => ({
    present: typeof initial === 'function' ? (initial as () => T)() : initial,
    past: [],
    future: [],
  }))

  const set = useCallback((updater: T | ((prev: T) => T)) => {
    setHistory(h => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(h.present) : updater
      return { present: next, past: [...h.past.slice(-49), h.present], future: [] }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.past.length === 0) return h
      const previous = h.past[h.past.length - 1]
      return { present: previous, past: h.past.slice(0, -1), future: [h.present, ...h.future] }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(h => {
      if (h.future.length === 0) return h
      const [next, ...rest] = h.future
      return { present: next, past: [...h.past, h.present], future: rest }
    })
  }, [])

  return { state: history.present, set, undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0 }
}
