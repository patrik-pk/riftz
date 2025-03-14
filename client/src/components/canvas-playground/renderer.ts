import { canMove, playerDirection } from '@/components/canvas-playground/CanvasPlayground'
import { rectangles } from './data'
import { map } from '@/components/canvas-playground/mapData'
import { Map } from './mapGenerator'
// TODO:
// - start working on physics
//   - rectangle collision
//   - reversed circle collision?

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

// TODO:
// - render only the parts that player needs to see
export class Renderer {
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

  map = new Map({
    mapWidth: 30,
    mapHeight: 30,
    tileSize: 100
  })

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

    // render layer 1 (unwalkable?)
    // this.ctx.save()
    // this.ctx.translate(-mapSize / 2, -mapSize / 2)
    // this.ctx.fillStyle = 'rgb(20, 60, 20, 1)'
    // this.ctx.beginPath()
    // this.ctx.rect(0, 0, mapSize, mapSize)
    // this.ctx.closePath()
    // this.ctx.fill()
    // this.ctx.restore()

    this.map.renderMap(this.canvas, this.ctx, this.playerPosition)

    // render walls
    // this.ctx.save()
    // this.ctx.strokeStyle = 'black'
    // this.ctx.lineWidth = 4
    // map.walls.forEach((wall) => {
    //   this.ctx.beginPath()
    //   this.ctx.moveTo(wall.pointA.x, wall.pointA.y)
    //   this.ctx.lineTo(wall.pointB.x, wall.pointB.y)
    //   this.ctx.stroke()
    //   this.ctx.closePath()
    // })
    // this.ctx.restore()

    // render player
    this.renderCircle({
      position: {
        x: this.playerPosition.x,
        y: this.playerPosition.y
      },
      size: this.playerSize,
      fillColor: collisionDetected ? 'red' : undefined
    })
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

  handlePhysics() {
    collisionDetected = false

    this.physicsObjects.forEach((obj) => {
      if (obj.type === 'rectangle') {
        collisionDetected = this.circleRectangleCollision({ position: this.playerPosition, size: this.playerSize }, obj)
      }
    })
  }

  circleRectangleCollision(circle: { position: IPlaygroundVector2; size: number }, rectangle: PhysicsRectangleObject) {
    // distance between circle center and center of sides of the rectangle
    const distX = Math.abs(circle.position.x - rectangle.position.x - rectangle.width / 2)
    const distY = Math.abs(circle.position.y - rectangle.position.y - rectangle.height / 2)

    if (distX > rectangle.width / 2 + circle.size) {
      return false
    }
    if (distY > rectangle.height / 2 + circle.size) {
      return false
    }

    if (distX <= rectangle.width / 2) {
      return true
    }
    if (distY <= rectangle.height / 2) {
      return true
    }

    // distance betwen circle center and rectangle starting points
    const dx = distX - rectangle.width / 2
    const dy = distY - rectangle.height / 2

    return dx * dx + dy * dy <= circle.size * circle.size
  }
}
