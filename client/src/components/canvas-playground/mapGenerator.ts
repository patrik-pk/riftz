import alea from 'alea'
import { IPlaygroundVector2 } from './renderer'
import { ControlNode, Node, SquareGrid } from '@/components/canvas-playground/node'

// TODO:
// - try clipping
// - research marching squares

export interface MapConstructorObj {
  seed?: string
  mapWidth?: number
  mapHeight?: number
  fillPercentage?: number
  tileSize?: number
}

export class Map {
  tiles: number[] // array of 0s and 1s, 1=0 = walkable space, 1 = block
  seed?: string
  mapWidth: number
  mapHeight: number
  fillPercentage: number
  tileSize: number

  totalMapWidth: number
  totalMapHeight: number

  squareGrid: SquareGrid

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
        newTiles.push(newTile)
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

  // BUG: pushing to the array makes the result different than adding it by index,
  //      maybe this method is wrong, because I loop y first?
  //      But even then it shouldnt matter because width is same as size currently?
  getTileIndex(x: number, y: number): number | null {
    if (x < 0 || y < 0) return null
    if (y >= this.mapHeight || x >= this.mapWidth) return null

    return x * this.mapWidth + y
  }

  renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, cameraPosition: IPlaygroundVector2) {
    ctx.save()

    const baseX = this.mapWidth / 2
    const baseY = this.mapHeight / 2

    const indexCenterX = Math.floor(baseX + cameraPosition.x / this.tileSize)
    const indexCenterY = Math.floor(baseY + cameraPosition.y / this.tileSize)

    // TODO: smth is wrong about this part, added +3 for temporary fix
    const amountOfTilesToRenderX = Math.ceil(canvas.width / this.tileSize) + 3
    const amountOfTilesToRenderY = Math.ceil(canvas.height / this.tileSize) + 3

    const indexStartX = indexCenterX - Math.ceil(amountOfTilesToRenderX / 2)
    const indexStartY = indexCenterY - Math.ceil(amountOfTilesToRenderY / 2)

    for (let y = 0; y < amountOfTilesToRenderY; y++) {
      for (let x = 0; x < amountOfTilesToRenderX; x++) {
        const tileX = indexStartX + x
        const tileY = indexStartY + y

        const tileIndex = this.getTileIndex(tileX, tileY)
        if (tileIndex === null) continue

        const tileValue = this.tiles[tileIndex]

        const positionX = -this.totalMapWidth / 2 + tileX * this.tileSize
        const positionY = -this.totalMapHeight / 2 + tileY * this.tileSize

        ctx.beginPath()
        ctx.fillStyle = tileValue === 0 ? '#111' : '#ccc'
        ctx.rect(positionX - 1, positionY - 1, this.tileSize + 2, this.tileSize + 2)
        ctx.fill()
        ctx.closePath()
      }
    }

    this.debugSquareNodes(ctx, amountOfTilesToRenderX, amountOfTilesToRenderY, indexStartX, indexStartY)

    ctx.restore()
  }

  // TODO: not rendering proper nodes based on camera
  debugSquareNodes(
    ctx: CanvasRenderingContext2D,
    amountOfTilesToRenderX: number,
    amountOfTilesToRenderY: number,
    indexStartX: number,
    indexStartY: number
  ) {
    ctx.save()

    for (let y = 0; y < amountOfTilesToRenderY; y++) {
      for (let x = 0; x < amountOfTilesToRenderX; x++) {
        const tileX = indexStartX + x
        const tileY = indexStartY + y

        const tileIndex = this.getTileIndex(tileX, tileY)
        if (tileIndex === null) continue

        const square = this.squareGrid.squares[tileIndex]
        const debugSize = this.tileSize / 10

        if (!square?.controlNodes) {
          // console.log(square)
          continue
        }

        // nodes
        ctx.save()
        // ctx.translate(Math.random() * 10, Math.random() * 10)

        Object.values(square.nodes).forEach((node) => {
          const controlNode = node as Node
          ctx.beginPath()
          ctx.fillStyle = 'orange'
          ctx.arc(controlNode.posisiton.x, controlNode.posisiton.y, debugSize, 0, 2 * Math.PI)
          ctx.fill()
          ctx.closePath()
        })

        // control nodes
        // Object.values(square.controlNodes).forEach(node => {
        //   const controlNode = node as ControlNode
        //   ctx.save()
        //   ctx.beginPath()
        //   ctx.globalAlpha = 0.3
        //   ctx.fillStyle = 'cyan'
        //   ctx.arc(controlNode.posisiton.x, controlNode.posisiton.y, debugSize, 0, 2 * Math.PI)
        //   ctx.fill()
        //   ctx.closePath()
        //   ctx.restore()
        // })

        // center?
        ctx.beginPath()
        ctx.fillStyle = 'purple'
        ctx.arc(
          square.controlNodes.topRight.posisiton.x - this.tileSize,
          square.controlNodes.topRight.posisiton.y - this.tileSize,
          debugSize,
          0,
          2 * Math.PI
        )
        ctx.fill()
        ctx.closePath()

        ctx.restore()
      }
    }

    ctx.restore()
  }
}
