import { IVector2 } from 'riftz-shared'

class Vector2 implements IVector2 {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  add(v: Vector2) {
    this.x += v.x
    this.y += v.y
    return this
  }

  subtract(v: Vector2) {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  multiply(value: number) {
    this.x *= value
    this.y *= value
    return this
  }

  unit() {
    const magnitude = this.magnitude()
    if (magnitude === 0) {
      return this.empty()
    }

    this.x /= magnitude
    this.y /= magnitude
    return this
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  empty() {
    this.x = 0
    this.y = 0
    return this
  }

  newCopy() {
    return new Vector2(this.x, this.y)
  }

  toFixed(value: number) {
    return { x: this.x.toFixed(value), y: this.y.toFixed(value) }
  }

  static add(v1: Vector2, v2: Vector2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y)
  }

  static subtract(v1: Vector2, v2: Vector2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y)
  }

  static multiply(v: Vector2, value: number) {
    return new Vector2(v.x * value, v.y * value)
  }

  static normal(v: Vector2) {
    const norm = new Vector2(-v.y, v.x)
    return Vector2.unit(norm)
  }

  static unit(v: Vector2) {
    const magnitude = Vector2.magnitude(v)
    if (magnitude === 0) {
      return Vector2.empty()
    }

    return new Vector2(v.x / magnitude, v.y / magnitude)
  }

  static magnitude(v: Vector2) {
    return Math.sqrt(v.x ** 2 + v.y ** 2)
  }

  static empty() {
    return new Vector2(0, 0)
  }

  static dotProduct(v1: Vector2, v2: Vector2) {
    return v1.x * v2.x + v1.y + v2.y
  }
}

export default Vector2
