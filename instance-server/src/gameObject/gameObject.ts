import { v4 as uuidv4 } from 'uuid'
import { gameManager } from '../server'
import { DEATH_ANIMATION_DURATION, FLOATING_INFO_DURATION } from '../utils/config'
import Vector2 from '../utils/vector2'
import { getProgress } from '../utils/utils'
import { IAnimation, IFloatingInfo, IGoCategory } from 'riftz-shared'
import { ISetTrigger } from '../gameManager/gameManager'

type SideTriggered = 'none' | 'left' | 'top' | 'right' | 'bottom'

const OLD_HP_STACK_DURATION = 200

export interface IGameObjectConstructorObj {
  id: string
  displayedName: string
  renderGameObjectId: string
  goCategory: IGoCategory
}

interface IVelocityEffect {
  id: string
  createdTimestamp: number
  duration: number
  finishTimestamp: number
  preventMovement: boolean
  directionVector: Vector2
}

export default abstract class GameObject {
  id: string
  renderGameObjectId: string
  displayedName: string
  goCategory: IGoCategory

  position: Vector2 = Vector2.empty()
  velocity: Vector2 = Vector2.empty()
  velocityEffects: Record<string, IVelocityEffect> = {}
  direction: number = 0

  healthPoints: number = 0
  currentHealth: number = 0
  oldHealth: number | null = null
  healthChangedTimestamp: number = 0

  weight: number = 0
  size: number = 0

  _isAlive: boolean = false

  animation: IAnimation | null = null
  floatingInfo: Record<string, IFloatingInfo> = {}
  debugInfo: Record<string, string> = {}

  constructor(obj: IGameObjectConstructorObj) {
    this.id = obj.id
    this.displayedName = obj.displayedName
    this.renderGameObjectId = obj.renderGameObjectId
    this.goCategory = obj.goCategory
  }

  get isAlive() {
    return this._isAlive
  }

  set isAlive(value: boolean) {
    this._isAlive = value
    this.onIsAliveChanged?.()
  }

  onUpdate?(setTrigger: ISetTrigger): void
  onLateUpdate?(setTrigger: ISetTrigger): void
  onDeath?(invokedBy?: GameObject): void
  onKill?(go: GameObject): void
  onDamageTaken?(damageAmount: number, invokedBy?: GameObject): void
  onHealthRestored?(healAmount: number, invokedBy?: GameObject): void
  onIsAliveChanged?(): void

  detectMapBoundaries(): SideTriggered {
    const { mapSize } = gameManager

    let sideTriggered: SideTriggered = 'none'

    if (this.position.x - this.size < 0) {
      this.position.x = 0 + this.size
      sideTriggered = 'left'
    } else if (this.position.x + this.size > mapSize) {
      this.position.x = mapSize - this.size
      sideTriggered = 'right'
    }

    if (this.position.y - this.size < 0) {
      this.position.y = 0 + this.size
      sideTriggered = 'top'
    } else if (this.position.y + this.size > mapSize) {
      this.position.y = mapSize - this.size
      sideTriggered = 'bottom'
    }

    return sideTriggered
  }

  addAnimation(animation: IAnimation) {
    this.animation = animation

    setTimeout(() => {
      if (this.animation?.id === animation.id) {
        this.animation = null
      }
    }, animation.duration)
  }

  addFloatingInfo(floatingInfo: Omit<IFloatingInfo, 'id' | 'createdAt'>) {
    const id = uuidv4()
    const createdAt = Date.now()

    this.floatingInfo[id] = {
      id,
      createdAt,
      ...floatingInfo,
    }

    setTimeout(() => {
      if (this.floatingInfo[id]) {
        delete this.floatingInfo[id]
      }
    }, FLOATING_INFO_DURATION)
  }

  receiveDamage(damageAmount: number, invokedBy?: GameObject) {
    // animation starts after OLD_HP_STACK_DURATION ms to create stackable effect
    if (!this.oldHealth || Date.now() > this.healthChangedTimestamp + OLD_HP_STACK_DURATION) {
      this.oldHealth = this.currentHealth
    }

    this.healthChangedTimestamp = Date.now()
    this.currentHealth -= damageAmount
    this.onDamageTaken?.(damageAmount, invokedBy)

    this.addFloatingInfo({
      type: 'damage',
      value: Math.round(damageAmount),
    })

    if (this.currentHealth <= 0) {
      this.handleDeath(invokedBy)
    }
  }

  restoreHealth(healAmount: number, invokedBy?: GameObject) {
    if (this.currentHealth + healAmount > this.healthPoints) {
      healAmount = this.healthPoints - this.currentHealth
    }

    this.currentHealth += healAmount
    this.onHealthRestored?.(healAmount, invokedBy)

    this.addFloatingInfo({
      type: 'heal',
      value: Math.round(healAmount),
    })
  }

  handleDeath(invokedBy?: GameObject) {
    this.isAlive = false

    if (invokedBy) {
      invokedBy.onKill?.(this)
    }

    const deathAnimation: IAnimation = {
      id: uuidv4(),
      createdAt: Date.now(),
      name: 'death-animation',
      duration: DEATH_ANIMATION_DURATION,
    }

    this.addAnimation(deathAnimation)
    this.onDeath?.(invokedBy)
  }

  calculateVelocity(): boolean {
    let preventMovement = false
    const velocity = Vector2.empty()
    for (const effectId in this.velocityEffects) {
      const effect = this.velocityEffects[effectId]
      const progress = getProgress(effect.createdTimestamp, effect.duration)
      const realProgress = Math.sin(progress * Math.PI)

      velocity.add(
        new Vector2(
          effect.directionVector.x * realProgress * 1.5,
          effect.directionVector.y * realProgress * 1.5
        )
      )

      if (effect.preventMovement) {
        preventMovement = true
      }
    }

    this.velocity = velocity

    return preventMovement
  }

  addVelocityEffect(effect: Omit<IVelocityEffect, 'id' | 'createdTimestamp' | 'finishTimestamp'>) {
    const id = uuidv4()
    const createdTimestamp = Date.now()
    const finishTimestamp = createdTimestamp + effect.duration
    this.velocityEffects[id] = {
      ...effect,
      id,
      createdTimestamp,
      finishTimestamp,
    }
  }

  removeOldVelocityEffects() {
    Object.keys(this.velocityEffects).forEach((effectId) => {
      const effect = this.velocityEffects[effectId]
      if (Date.now() > effect.finishTimestamp) {
        delete this.velocityEffects[effectId]
      }
    })
  }
}
