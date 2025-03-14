import GameObject, { IGameObjectConstructorObj } from '../gameObject/gameObject'
import Vector2 from '../utils/vector2'
import { gameManager } from '../server'
import { circleCollision } from '../utils/collisions'
import Player from '../player/player'
import Mob from '../mob/mob'
import { IAmount } from 'riftz-shared'

interface IProjectileType {
  id: string
  displayedName: string
  renderGameObjectId: string
  range: number
  size: number
  movementSpeed: number
  assetPath: string
}

export interface IProjectileConstructorObj
  extends Omit<IGameObjectConstructorObj, 'renderGameObjectId' | 'displayedName' | 'goCategory'> {
  projectileType: IProjectileType
  invokedBy: GameObject
  position: Vector2
  direction: number
  damageAmount: IAmount
}

class Projectile extends GameObject /*implements IProjectile*/ {
  projectileTypeId: string
  invokedBy: GameObject
  damageAmount: IAmount
  movementSpeed: number
  traveledDistance: number = 0
  range: number

  constructor(obj: IProjectileConstructorObj) {
    super({
      ...obj,
      displayedName: obj.projectileType.displayedName,
      renderGameObjectId: obj.projectileType.renderGameObjectId,
      goCategory: 'projectile',
    })
    this.projectileTypeId = obj.projectileType.id
    this.invokedBy = obj.invokedBy
    this.damageAmount = obj.damageAmount
    this.movementSpeed = obj.projectileType.movementSpeed
    this.range = obj.projectileType.range
    this.size = obj.projectileType.size
  }

  onUpdate(): void {
    this.move()
    this.handleCollision()
  }

  move() {
    let speed = this.movementSpeed / gameManager.tickRate

    const moveX = Math.cos(this.direction) * speed
    const moveY = Math.sin(this.direction) * speed

    this.position.x += moveX
    this.position.y += moveY
    this.traveledDistance += moveX + moveY

    if (this.traveledDistance >= this.range) {
      delete gameManager.projectiles[this.id]
      return
    }
  }

  handleCollision() {
    const gameObjects = [...gameManager.getAlivePlayers(), ...gameManager.getAliveMobs()]

    for (const go of gameObjects) {
      if (go.id === this.invokedBy.id) {
        continue
      }

      if (circleCollision(this, go)) {
        const damage =
          this.invokedBy instanceof Player || this.invokedBy instanceof Mob
            ? /*this.invokedBy.calculateAmount(this.damageAmount)*/ 5
            : 0
        go.receiveDamage(damage, this.invokedBy)
        delete gameManager.projectiles[this.id]
      }
    }
  }
}

export default Projectile
