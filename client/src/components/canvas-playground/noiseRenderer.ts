import alea from 'alea'
import { canMove, playerDirection } from '@/components/canvas-playground/CanvasPlayground'
import { rectangles } from './data'
// TODO:
// - before continuing with procedural generation try drawing and handling physics without it first
//   - define walls
//   - draw unwalkable area
//   - somehow clip and draw walkable area
//   - draw walls

let collisionDetected = false

export interface IPlaygroundVector2 {
  x: number
  y: number
}

interface PhysicsObject {
  position: IPlaygroundVector2
}

export interface PhysicsRectangleObject extends PhysicsObject {
  type: 'rectangle'
  width: number
  height: number
}

export class NoiseRenderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  playerPosition: IPlaygroundVector2 = {
    x: 0,
    y: 0
  }
  playerSize = 20
  playerSpeed = 3

  // TODO: define some rectangles and render them, then handle physics
  physicsObjects: PhysicsRectangleObject[] = rectangles

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas
    this.ctx = ctx
  }

  render() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (canMove) {
      this.playerPosition.x += playerDirection.x * this.playerSpeed
      this.playerPosition.y += playerDirection.y * this.playerSpeed
    }

    this.moveCamera(this.playerPosition)

    const prng = alea('seed3')

    const noiseSize = 50
    const noiseImage = this.ctx.createImageData(noiseSize, noiseSize)

    let noiseMap: number[] = [] // x and y values of 0 and 1, 0 = walkable space, 1 = wall
    const fillPercentage = 0.35

    // STEP 1 - Generate random 0 and 1 values
    for (let y = 0; y < noiseSize; y++) {
      for (let x = 0; x < noiseSize; x++) {
        const noiseValue = prng()
        const index = y * noiseSize + x
        const convertedValue = noiseValue < fillPercentage ? 1 : 0
        noiseMap[index] = convertedValue
      }
    }

    // STEP 2 - Smoothen map
    const getSurroundingWallCount = (x: number, y: number): number => {
      let wallCount = 0

      for (let neighbourX = x - 1; neighbourX <= x + 1; neighbourX++) {
        for (let neighbourY = y - 1; neighbourY <= y + 1; neighbourY++) {
          const index = neighbourY * noiseSize + neighbourX
          wallCount += noiseMap[index] ?? 0
        }
      }

      return wallCount
    }

    const smoothenMap = () => {
      const newTiles = []

      for (let y = 0; y < noiseSize; y++) {
        for (let x = 0; x < noiseSize; x++) {
          const surroundedWallCount = getSurroundingWallCount(x, y)
          const newTile = surroundedWallCount >= 4 ? 1 : 0
          newTiles.push(newTile)
        }
      }

      noiseMap = newTiles
    }

    // STEP 3 - Convert values into colors and assign them to the image
    const drawMap = () => {
      for (let y = 0; y < noiseSize; y++) {
        for (let x = 0; x < noiseSize; x++) {
          const valueIndex = y * noiseSize + x
          const convertedValue = noiseMap[valueIndex]
          const colorIndex = (y * noiseSize + x) * 4

          noiseImage.data[colorIndex] = convertedValue === 1 ? 0 : 255
          noiseImage.data[colorIndex + 1] = convertedValue === 1 ? 0 : 255
          noiseImage.data[colorIndex + 2] = convertedValue === 1 ? 0 : 255
          noiseImage.data[colorIndex + 3] = 255
        }
      }

      this.ctx.putImageData(noiseImage, this.canvas.width / 2 - noiseSize / 2, this.canvas.height / 2 - noiseSize / 2)
    }

    // TOOD:
    // - Continue
    //   - https://www.youtube.com/watch?v=v7yyZZjF1z4&list=PLFt_AvWsXl0eZgMK_DT5_biRkWXftAOf9
    //   - https://www.youtube.com/watch?v=FSNUp_8Xvqo

    smoothenMap()
    smoothenMap()
    smoothenMap()
    smoothenMap()
    drawMap()

    // render player
    // this.renderCircle({
    //   position: {
    //     x: this.playerPosition.x,
    //     y: this.playerPosition.y,
    //   },
    //   size: this.playerSize,
    //   fillColor: collisionDetected ? 'red' : undefined,
    // })
  }

  moveCamera(position: IPlaygroundVector2) {
    this.ctx.translate(-position.x + this.canvas.width / 2, -position.y + this.canvas.height / 2)
  }

  renderRectangle(params: {
    obj: PhysicsRectangleObject
    fillColor?: string
    strokeColor?: string
    strokeWidth?: number
  }) {
    const { obj, fillColor, strokeColor, strokeWidth } = params

    this.ctx.save()
    // this.ctx.translate(obj.position.x, obj.position.y)
    this.ctx.fillStyle = fillColor ?? 'rgb(100, 100, 100, 1)'
    this.ctx.beginPath()
    // this.ctx.rect(0, 0, obj.width, obj.height)
    this.ctx.rect(obj.position.x, obj.position.y, obj.width, obj.height)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.strokeStyle = strokeColor ?? 'black'
    if (strokeWidth) {
      this.ctx.lineWidth = strokeWidth
      this.ctx.stroke()
    }
    this.ctx.restore()
  }

  renderCircle(params: {
    position: IPlaygroundVector2
    size: number
    fillColor?: string
    strokeColor?: string
    strokeWidth?: number
  }) {
    const { position, size, fillColor, strokeColor, strokeWidth } = params

    this.ctx.save()
    // this.ctx.translate()
    this.ctx.fillStyle = fillColor ?? 'rgb(100, 100, 100, 1)'
    this.ctx.beginPath()
    this.ctx.arc(position.x, position.y, size, 0, 2 * Math.PI)
    // this.ctx.arc(0, 0, size, 0, 2 * Math.PI)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.strokeStyle = strokeColor ?? 'black'
    if (strokeWidth) {
      this.ctx.lineWidth = strokeWidth
      this.ctx.stroke()
    }
    this.ctx.restore()
  }
}
