import { IVector2 } from 'riftz-shared'

interface Wall {
  pointA: IVector2
  pointB: IVector2
}

class Map {
  walls: Wall[]

  constructor() {
    this.walls = [
      { pointA: { x: -200, y: -120 }, pointB: { x: -170, y: -20 } },
      { pointA: { x: -170, y: -20 }, pointB: { x: -200, y: 100 } },
      { pointA: { x: -200, y: 100 }, pointB: { x: -100, y: 100 } }
    ]
  }
}

export const map = new Map()
