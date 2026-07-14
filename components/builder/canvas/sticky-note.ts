export interface StickyNote {
  id: string
  x: number
  y: number
  text: string
  color: 'pink' | 'yellow' | 'blue'
  author: string
}

export const STICKY_COLORS: Record<StickyNote['color'], { bg: string; border: string }> = {
  pink: { bg: '#FBEAF0', border: '#F2C7D6' },
  yellow: { bg: '#FCF3D9', border: '#EFDFA0' },
  blue: { bg: '#E6EEFB', border: '#C3D6F2' },
}
