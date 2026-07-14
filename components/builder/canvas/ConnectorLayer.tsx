'use client'
import { Heart, Sparkles, Gift, Camera, MessageCircle } from 'lucide-react'
import { NODE_W, NODE_H, boundsOf, type NodePosition } from './canvas-layout'

const BADGE_ICONS = [Heart, Sparkles, Gift, Camera, MessageCircle]
const BADGE_COLORS = ['#D14D72', '#D9A441', '#D14D72', '#D9A441', '#D14D72']

interface Point { x: number; y: number }

function anchorsFor(a: NodePosition, b: NodePosition): { start: Point; end: Point } {
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy >= 0
      ? { start: { x: a.x + NODE_W / 2, y: a.y + NODE_H }, end: { x: b.x + NODE_W / 2, y: b.y } }
      : { start: { x: a.x + NODE_W / 2, y: a.y }, end: { x: b.x + NODE_W / 2, y: b.y + NODE_H } }
  }
  return dx >= 0
    ? { start: { x: a.x + NODE_W, y: a.y + NODE_H / 2 }, end: { x: b.x, y: b.y + NODE_H / 2 } }
    : { start: { x: a.x, y: a.y + NODE_H / 2 }, end: { x: b.x + NODE_W, y: b.y + NODE_H / 2 } }
}

function bezierControls(start: Point, end: Point) {
  const vertical = Math.abs(end.y - start.y) >= Math.abs(end.x - start.x)
  if (vertical) {
    const mid = start.y + (end.y - start.y) / 2
    return { c1: { x: start.x, y: mid }, c2: { x: end.x, y: mid } }
  }
  const mid = start.x + (end.x - start.x) / 2
  return { c1: { x: mid, y: start.y }, c2: { x: mid, y: end.y } }
}

function bezierPointAt(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  }
}

export function ConnectorLayer({ nodes }: { nodes: NodePosition[] }) {
  if (nodes.length < 2) return null
  const bounds = boundsOf(nodes)
  const pad = 80

  return (
    <svg
      style={{ position: 'absolute', left: bounds.minX - pad, top: bounds.minY - pad, pointerEvents: 'none', overflow: 'visible' }}
      width={bounds.maxX - bounds.minX + pad * 2}
      height={bounds.maxY - bounds.minY + pad * 2}
    >
      <g transform={`translate(${pad - bounds.minX}, ${pad - bounds.minY})`}>
        {nodes.slice(1).map((b, i) => {
          const a = nodes[i]
          const { start, end } = anchorsFor(a, b)
          const { c1, c2 } = bezierControls(start, end)
          const badgeCenter = bezierPointAt(0.5, start, c1, c2, end)
          const Icon = BADGE_ICONS[i % BADGE_ICONS.length]
          const color = BADGE_COLORS[i % BADGE_COLORS.length]
          return (
            <g key={b.id}>
              <path
                d={`M ${start.x},${start.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${end.x},${end.y}`}
                fill="none"
                stroke="#D14D72"
                strokeOpacity={0.35}
                strokeWidth={2}
                strokeDasharray="1 7"
                strokeLinecap="round"
              />
              <circle cx={badgeCenter.x} cy={badgeCenter.y} r={16} fill="white" stroke={color} strokeWidth={1.5} />
              <foreignObject x={badgeCenter.x - 8} y={badgeCenter.y - 8} width={16} height={16}>
                <Icon width={16} height={16} color={color} />
              </foreignObject>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
