import type { Scene } from '@/lib/types'

export const NODE_W = 256
export const NODE_H = 208

const COLS = 3
const COL_GAP = 320
const ROW_GAP = 280
const STAGGER = 56

export interface NodePosition {
  id: string
  x: number
  y: number
}

/** Serpentine flow layout — snakes left-to-right then right-to-left per row, with a slight vertical
 *  stagger on alternating nodes so the graph reads as an organic flow rather than a strict grid. */
export function layoutScenes(scenes: Scene[]): NodePosition[] {
  return scenes.map((scene, i) => {
    const row = Math.floor(i / COLS)
    const colInRow = i % COLS
    const col = row % 2 === 0 ? colInRow : COLS - 1 - colInRow
    const x = col * COL_GAP
    const y = row * ROW_GAP + (i % 2 === 1 ? STAGGER : 0)
    return { id: scene.id, x, y }
  })
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function boundsOf(positions: NodePosition[]): Bounds {
  if (positions.length === 0) return { minX: 0, minY: 0, maxX: NODE_W, maxY: NODE_H }
  return positions.reduce(
    (b, p) => ({
      minX: Math.min(b.minX, p.x),
      minY: Math.min(b.minY, p.y),
      maxX: Math.max(b.maxX, p.x + NODE_W),
      maxY: Math.max(b.maxY, p.y + NODE_H),
    }),
    { minX: p0(positions).x, minY: p0(positions).y, maxX: p0(positions).x + NODE_W, maxY: p0(positions).y + NODE_H },
  )
}

function p0(positions: NodePosition[]) {
  return positions[0]
}
