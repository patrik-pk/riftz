import { IPlaygroundVector2 } from '@/components/canvas-playground/renderer'

export const normalizeVector = (x: number, y: number): IPlaygroundVector2 => {
  let length = Math.sqrt(x * x + y * y)
  if (length === 0) {
    length = 0.1
  }

  return {
    x: x / length,
    y: y / length
  }
}
