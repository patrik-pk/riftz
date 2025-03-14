import { MapGenerator, MapConstructorObj } from '@/components/map-editor/map'
import { Node } from '@/components/map-editor/node'
import store from '@/redux/store'
import { IVector2 } from 'riftz-shared'

const defaultActiveColor = '#ccc'
const defaultInactiveColor = '#000'
const defaultWallColor = 'ff0000'

// TODO: amount of tiles to render is not properly scaled with zoom
export class MapEditorRenderer {
  canvas: HTMLCanvasElement | null = null
  ctx: CanvasRenderingContext2D | null = null
  cameraPosition: IVector2 = { x: 0, y: 0 }
  zoom: number = 1
  lastMousePosition: IVector2 | null = null

  map: MapGenerator | null = null

  constructor() {}

  initializeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas
    this.ctx = ctx
  }

  loadMap(mapData: MapConstructorObj | null) {
    if (mapData === null) {
      this.map = null
      return
    }

    this.map = new MapGenerator(mapData)
  }

  moveAndZoomCamera() {
    if (!this.canvas || !this.ctx) {
      return
    }

    let cameraX = -(this.cameraPosition.x * this.zoom)
    cameraX += this.canvas.width / 2

    let cameraY = -(this.cameraPosition.y * this.zoom)
    cameraY += this.canvas.height / 2

    this.ctx.translate(cameraX, cameraY)
    this.ctx.scale(this.zoom, this.zoom)
  }

  getMapData() {
    return store.getState().mapEditor.currentMapData
  }

  render() {
    if (!this.canvas || !this.ctx || !this.map) {
      return
    }

    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.moveAndZoomCamera()

    this.renderMap(this.canvas, this.ctx, this.cameraPosition, this.zoom)

    // this.renderMap()
  }

  renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, cameraPosition: IVector2, zoom: number) {
    if (!this.map) return
    const debugOptions = store.getState().mapEditor.debugOptions
    const mapData = this.getMapData()

    ctx.save()

    const baseX = this.map.mapWidth / 2
    const baseY = this.map.mapHeight / 2

    const indexCenterX = Math.floor(baseX + cameraPosition.x / this.map.tileSize)
    const indexCenterY = Math.floor(baseY + cameraPosition.y / this.map.tileSize)

    // TODO: smth is wrong about this part, added +3 for temporary fix
    const amountOfTilesToRenderX = Math.ceil(canvas.width / this.map.tileSize / zoom) + 3
    const amountOfTilesToRenderY = Math.ceil(canvas.height / this.map.tileSize / zoom) + 3

    const indexStartX = indexCenterX - Math.ceil(amountOfTilesToRenderX / 2)
    const indexStartY = indexCenterY - Math.ceil(amountOfTilesToRenderY / 2)

    // render ground temporary
    ctx.save()
    ctx.fillStyle = mapData?.activeColor ?? defaultActiveColor
    ctx.rect(
      -this.map.totalMapWidth / 2 + this.map.tileSize / 2,
      -this.map.totalMapHeight / 2 + this.map.tileSize / 2,
      this.map.totalMapWidth - this.map.tileSize,
      this.map.totalMapHeight - this.map.tileSize
    )
    ctx.fill()
    ctx.restore()

    if (debugOptions.renderMesh) {
      this.renderMesh(ctx, amountOfTilesToRenderX, amountOfTilesToRenderY, indexStartX, indexStartY)
    }
    if (debugOptions.renderBase) {
      this.renderBase(ctx, amountOfTilesToRenderX, amountOfTilesToRenderY, indexStartX, indexStartY)
    }
    if (debugOptions.renderSquareNodes) {
      this.debugSquareNodes(ctx, amountOfTilesToRenderX, amountOfTilesToRenderY, indexStartX, indexStartY)
    }
    if (debugOptions.renderCoordinates) {
      this.debugTileCoordinates(ctx, amountOfTilesToRenderX, amountOfTilesToRenderY, indexStartX, indexStartY)
    }

    this.renderWalls(ctx, amountOfTilesToRenderX, amountOfTilesToRenderY, indexStartX, indexStartY)

    ctx.restore()
  }

  renderMapPreview(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    if (!this.map) return

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    const tileSize = Math.min(canvas.width / this.map.mapWidth, canvas.height / this.map.mapHeight)
    const totalWidth = tileSize * this.map.mapWidth
    const totalHeight = tileSize * this.map.mapHeight

    ctx.save()
    ctx.translate(-totalWidth / 2, -totalHeight / 2)

    for (let y = 0; y < this.map.mapHeight; y++) {
      for (let x = 0; x < this.map.mapWidth; x++) {
        const tileIndex = this.map.getTileIndex(x, y)
        if (tileIndex === null) continue
        const tile = this.map.tiles[tileIndex]
        ctx.beginPath()
        ctx.fillStyle = tile === 1 ? '#ccc' : 'black'
        ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize)
        ctx.fill()
        ctx.closePath()
      }
    }

    ctx.restore()
  }

  renderBase(
    ctx: CanvasRenderingContext2D,
    amountOfTilesToRenderX: number,
    amountOfTilesToRenderY: number,
    indexStartX: number,
    indexStartY: number
  ) {
    if (!this.map) return

    for (let y = 0; y < amountOfTilesToRenderY; y++) {
      for (let x = 0; x < amountOfTilesToRenderX; x++) {
        const tileX = indexStartX + x
        const tileY = indexStartY + y

        const tileIndex = this.map.getTileIndex(tileX, tileY)
        if (tileIndex === null) continue

        const tileValue = this.map.tiles[tileIndex]

        const positionX = -this.map.totalMapWidth / 2 + tileX * this.map.tileSize
        const positionY = -this.map.totalMapHeight / 2 + tileY * this.map.tileSize

        ctx.beginPath()
        ctx.globalAlpha = 0.5
        ctx.fillStyle = tileValue === 0 ? 'orange' : '#ccc'
        ctx.rect(positionX - 1, positionY - 1, this.map.tileSize + 2, this.map.tileSize + 2)
        ctx.fill()
        ctx.closePath()
      }
    }
  }

  renderTexture(
    ctx: CanvasRenderingContext2D,
    amountOfTilesToRenderX: number,
    amountOfTilesToRenderY: number,
    indexStartX: number,
    indexStartY: number
  ) {
    if (!this.map) return

    for (let y = 0; y < amountOfTilesToRenderY; y++) {
      for (let x = 0; x < amountOfTilesToRenderX; x++) {
        const tileX = indexStartX + x
        const tileY = indexStartY + y

        const tileIndex = this.map.getTileIndex(tileX, tileY)
        if (tileIndex === null) continue

        // TODO: move into separate data structure to avoid this triggering on each render
        const shouldRenderTexture = ((): boolean => {
          const tileValue = this.map.tiles[tileIndex]
          if (tileValue === 1) return true

          const adjancedTilesPositions: IVector2[] = [
            { x: x - 1, y },
            { x: x + 1, y },
            { x, y: y - 1 },
            { x, y: y + 1 }
          ]

          const anyAdjancedTilesActive = adjancedTilesPositions.some((position) => {
            if (!this.map) return false
            const adjancedTileIndex = this.map.getTileIndex(position.x, position.y)
            if (adjancedTileIndex === null) return false
            const adjancedTileValue = this.map.tiles[adjancedTileIndex]
            return adjancedTileValue === 1
          })

          return anyAdjancedTilesActive
        })()

        if (!shouldRenderTexture) continue

        const textureSize: IVector2 = { x: 4, y: 4 }

        const textureIndices: IVector2 = {
          x: x % textureSize.x,
          y: y % textureSize.y
        }

        const positionX = -this.map.totalMapWidth / 2 + tileX * this.map.tileSize
        const positionY = -this.map.totalMapHeight / 2 + tileY * this.map.tileSize

        // continue with texture render
      }
    }
  }

  renderWalls(
    ctx: CanvasRenderingContext2D,
    amountOfTilesToRenderX: number,
    amountOfTilesToRenderY: number,
    indexStartX: number,
    indexStartY: number
  ) {
    if (!this.map) return
    const mapData = this.getMapData()

    ctx.save()

    for (let y = 0; y < amountOfTilesToRenderY; y++) {
      for (let x = 0; x < amountOfTilesToRenderX; x++) {
        const tileX = indexStartX + x
        const tileY = indexStartY + y

        const tileIndex = this.map.getTileIndex(tileX, tileY)
        if (tileIndex === null) continue

        const walls = this.map.walls[tileIndex]
        if (!walls) continue

        ctx.save()

        walls.forEach((wall) => {
          ctx.beginPath()

          ctx.moveTo(wall.pointA.x, wall.pointA.y)
          ctx.lineTo(wall.pointB.x, wall.pointB.y)

          ctx.closePath()

          ctx.strokeStyle = mapData?.wallColor ?? defaultWallColor
          ctx.lineWidth = 5
          ctx.stroke()
        })

        ctx.restore()
      }
    }

    ctx.restore()
  }

  renderMesh(
    ctx: CanvasRenderingContext2D,
    amountOfTilesToRenderX: number,
    amountOfTilesToRenderY: number,
    indexStartX: number,
    indexStartY: number
  ) {
    if (!this.map) return
    const mapData = this.getMapData()

    ctx.save()

    for (let y = 0; y < amountOfTilesToRenderY; y++) {
      for (let x = 0; x < amountOfTilesToRenderX; x++) {
        const tileX = indexStartX + x
        const tileY = indexStartY + y

        const tileIndex = this.map.getTileIndex(tileX, tileY)
        if (tileIndex === null) continue

        const square = this.map.squareGrid.squares[tileIndex]

        if (!square?.controlNodes) {
          // console.log(square)
          continue
        }

        const activeSquarePoints = this.map.getSquareActivePoints(square)

        // const checkIndex = this.map.getTileIndex(40, 60)
        // if (checkIndex === tileIndex) {
        //   console.log(square.configurationIndex)
        // }
        if (!activeSquarePoints.length) continue

        ctx.save()
        ctx.beginPath()

        ctx.moveTo(activeSquarePoints[0].x, activeSquarePoints[0].y)

        for (let i = 1; i < activeSquarePoints.length; i++) {
          ctx.lineTo(activeSquarePoints[i].x, activeSquarePoints[i].y)
        }

        ctx.closePath()

        ctx.fillStyle = mapData?.inactiveColor ?? defaultInactiveColor
        ctx.fill()

        ctx.restore()
      }
    }

    ctx.restore()
  }

  debugTileCoordinates(
    ctx: CanvasRenderingContext2D,
    amountOfTilesToRenderX: number,
    amountOfTilesToRenderY: number,
    indexStartX: number,
    indexStartY: number
  ) {
    if (!this.map) return

    ctx.save()

    for (let y = 0; y < amountOfTilesToRenderY; y++) {
      for (let x = 0; x < amountOfTilesToRenderX; x++) {
        const tileX = indexStartX + x
        const tileY = indexStartY + y

        const tileIndex = this.map.getTileIndex(tileX, tileY)
        if (tileIndex === null) continue

        let positionX = -this.map.totalMapWidth / 2 + tileX * this.map.tileSize
        let positionY = -this.map.totalMapHeight / 2 + tileY * this.map.tileSize

        positionX += this.map.tileSize / 2
        positionY += this.map.tileSize / 2

        const tileValue = this.map.tiles[tileIndex]

        // TODO: use outlined text from renderer
        ctx.beginPath()
        ctx.fillStyle = 'lime'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `${this.map.tileSize * 0.2}px Arial`
        ctx.fillText(`${tileX}, ${tileY}, ${tileValue}`, positionX, positionY)
        ctx.closePath()
      }
    }

    ctx.restore()
  }

  // TODO:
  // - not rendering proper nodes based on camera
  // - when not square doesn't work well
  debugSquareNodes(
    ctx: CanvasRenderingContext2D,
    amountOfTilesToRenderX: number,
    amountOfTilesToRenderY: number,
    indexStartX: number,
    indexStartY: number
  ) {
    if (!this.map) return
    ctx.save()

    for (let y = 0; y < amountOfTilesToRenderY; y++) {
      for (let x = 0; x < amountOfTilesToRenderX; x++) {
        const tileX = indexStartX + x
        const tileY = indexStartY + y

        const tileIndex = this.map.getTileIndex(tileX, tileY)
        if (tileIndex === null) continue

        const square = this.map.squareGrid.squares[tileIndex]
        const debugSize = this.map.tileSize / 10

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
          square.controlNodes.topRight.posisiton.x - this.map.tileSize,
          square.controlNodes.topRight.posisiton.y - this.map.tileSize,
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

export const mapEditorRenderer = new MapEditorRenderer()
