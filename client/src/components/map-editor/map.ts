import alea from 'alea'
import { Square, SquareGrid } from './node'
import { IVector2 } from 'riftz-shared'

// TODO:
// - refactor this strictly into map generator and remove all render logic from here

interface Wall {
  pointA: IVector2
  pointB: IVector2
}

class Wall {
  constructor(pointA: IVector2, pointB: IVector2) {
    this.pointA = pointA
    this.pointB = pointB
  }
}

type WallsInTile = Wall[]

export interface MapConstructorObj {
  seed?: string
  mapWidth?: number
  mapHeight?: number
  fillPercentage?: number
  tileSize?: number
}

export class MapGenerator {
  tiles: number[] // array of 0s and 1s, 1=0 = walkable space, 1 = block
  seed?: string
  mapWidth: number
  mapHeight: number
  fillPercentage: number
  tileSize: number

  totalMapWidth: number
  totalMapHeight: number

  squareGrid: SquareGrid
  walls: WallsInTile[]

  constructor(obj?: MapConstructorObj) {
    const { seed, mapWidth, mapHeight, fillPercentage, tileSize } = obj ?? {}

    this.seed = seed
    this.mapWidth = mapWidth ?? 100
    this.mapHeight = mapHeight ?? 100
    this.fillPercentage = fillPercentage ?? 0.5
    this.tileSize = tileSize ?? 10

    this.totalMapWidth = this.mapWidth * this.tileSize
    this.totalMapHeight = this.mapHeight * this.tileSize

    this.tiles = this.generateMap()
    this.smoothenMap()
    this.smoothenMap()

    this.squareGrid = new SquareGrid(this)
    this.walls = this.generateWalls()
  }

  generateWalls(): WallsInTile[] {
    const walls: WallsInTile[] = []

    for (let y = 0; y < this.mapHeight - 1; y++) {
      for (let x = 0; x < this.mapWidth - 1; x++) {
        const tileIndex = this.getTileIndex(x, y)
        if (tileIndex === null) continue

        const square = this.squareGrid.squares[tileIndex]
        if (!square) continue

        walls[tileIndex] = this.getSquareWalls(square)
      }
    }

    return walls
  }

  generateMap(): number[] {
    const tiles: number[] = []
    const prng = alea(this.seed ?? '')

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const noiseValue = prng()
        const convertedValue = noiseValue < this.fillPercentage ? 1 : 0
        const tileIndex = this.getTileIndex(x, y)
        if (tileIndex === null) continue
        tiles[tileIndex] = convertedValue
      }
    }

    return tiles
  }

  smoothenMap() {
    const newTiles = []

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const surroundedWallCount = this.getSurroundingWallCount(x, y)
        const newTile = surroundedWallCount >= 4 ? 1 : 0
        const tileIndex = this.getTileIndex(x, y)
        if (tileIndex === null) continue
        newTiles[tileIndex] = newTile
      }
    }

    this.tiles = newTiles
  }

  getSurroundingWallCount(x: number, y: number): number {
    let wallCount = 0

    for (let neighbourX = x - 1; neighbourX <= x + 1; neighbourX++) {
      for (let neighbourY = y - 1; neighbourY <= y + 1; neighbourY++) {
        const tileIndex = this.getTileIndex(neighbourX, neighbourY)
        if (tileIndex === null) continue
        wallCount += this.tiles[tileIndex] ?? 0
      }
    }

    return wallCount
  }

  getTileIndex(x: number, y: number): number | null {
    if (x < 0 || y < 0) return null
    if (y >= this.mapHeight || x >= this.mapWidth) return null

    return x + y * this.mapWidth
  }

  getSquareWalls(square: Square): WallsInTile {
    const centerLeft = square.nodes.centerLeft.posisiton
    const centerRight = square.nodes.centerRight.posisiton
    const centerTop = square.nodes.centerTop.posisiton
    const centerBottom = square.nodes.centerBottom.posisiton

    switch (square.configurationIndex) {
      case 0:
        return []

      // 1 point
      case 1:
        // return [centerBottom, bottomLeft, centerLeft]
        return [new Wall(centerLeft, centerBottom)]
      case 2:
        return [new Wall(centerRight, centerBottom)]
      case 4:
        return [new Wall(centerTop, centerRight)]
      case 8:
        return [new Wall(centerTop, centerLeft)]

      // // 2 points
      case 3:
        return [new Wall(centerLeft, centerRight)]
      case 6:
        return [new Wall(centerTop, centerBottom)]
      case 9:
        return [new Wall(centerTop, centerBottom)]
      case 12:
        return [new Wall(centerLeft, centerRight)]
      case 5:
        return [new Wall(centerLeft, centerTop), new Wall(centerRight, centerBottom)]
      case 10:
        return [new Wall(centerLeft, centerBottom), new Wall(centerTop, centerRight)]

      // // 3 points
      case 7:
        return [new Wall(centerTop, centerLeft)]
      case 11:
        return [new Wall(centerTop, centerRight)]
      case 13:
        return [new Wall(centerBottom, centerRight)]
      case 14:
        return [new Wall(centerBottom, centerLeft)]

      // 4 points
      // case 15:
      //   return [topLeft, topRight, bottomRight, bottomLeft]

      default:
        return []
    }
  }

  getSquareActivePoints(square: Square): IVector2[] {
    const topLeft = square.controlNodes.topLeft.posisiton
    const topRight = square.controlNodes.topRight.posisiton
    const bottomLeft = square.controlNodes.bottomLeft.posisiton
    const bottomRight = square.controlNodes.bottomRight.posisiton

    const centerLeft = square.nodes.centerLeft.posisiton
    const centerRight = square.nodes.centerRight.posisiton
    const centerTop = square.nodes.centerTop.posisiton
    const centerBottom = square.nodes.centerBottom.posisiton

    switch (square.configurationIndex) {
      case 0:
        return []

      // 1 point
      case 1:
        return [centerBottom, bottomLeft, centerLeft]
      case 2:
        return [centerRight, bottomRight, centerBottom]
      case 4:
        return [centerTop, topRight, centerRight]
      case 8:
        return [topLeft, centerTop, centerLeft]

      // 2 points
      case 3:
        return [centerRight, bottomRight, bottomLeft, centerLeft]
      case 6:
        return [centerTop, topRight, bottomRight, centerBottom]
      case 9:
        return [topLeft, centerTop, centerBottom, bottomLeft]
      case 12:
        return [topLeft, topRight, centerRight, centerLeft]
      case 5:
        return [centerTop, topRight, centerRight, centerBottom, bottomLeft, centerLeft]
      case 10:
        return [topLeft, centerTop, centerRight, bottomRight, centerBottom, centerLeft]

      // 3 points
      case 7:
        return [centerTop, topRight, bottomRight, bottomLeft, centerLeft, centerTop]
      case 11:
        return [topLeft, centerTop, centerRight, bottomRight, bottomLeft]
      case 13:
        return [topLeft, topRight, centerRight, centerBottom, bottomLeft]
      case 14:
        return [topLeft, topRight, bottomRight, centerBottom, centerLeft]

      // 4 points
      case 15:
        return [topLeft, topRight, bottomRight, bottomLeft]

      default:
        return []
    }
  }
}
