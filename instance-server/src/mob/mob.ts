import { v4 as uuidv4 } from 'uuid'
import { randomBetween } from '../utils/utils'
import { DEATH_ANIMATION_DURATION, MOB_AGRESSIVE_RANGE } from '../utils/config'
import { gameManager } from '../server'
import { circleCollision } from '../utils/collisions'
import GameObject from '../gameObject/gameObject'
import Vector2 from '../utils/vector2'
import { EffectManager } from '../effects/EffectManager'
import Player from '../player/player'
import {
  IMobSerialized,
  MobBehavior,
  MobData,
  RangeType,
  allDropableItems,
  allMobData,
  allMobStatKeys,
  baseMobStats,
  levelScalingStats,
} from 'riftz-shared'
import { ISetTrigger } from '../gameManager/gameManager'

interface IMobTarget {
  gameObjectId: string
  type: 'attack' | 'escape'
}

type RangedSideWaysDirection = 'positive' | 'negative'

interface IMobConstructorObj {
  mobDataId: string
  level: number
}

export default class Mob extends GameObject {
  mobDataId: string

  behavior: MobBehavior
  rangeType: RangeType
  level: number

  attackSpeed: number = 0
  attackPower: number = 0
  movementSpeed: number = 0

  goalDirection: number
  target: IMobTarget | null = null
  nextAttackAvailableTimestamp: number = 0
  rangedSideWaysDirection: RangedSideWaysDirection = 'positive'
  nextSidewaysDirectionChangeTimestamp: number = 0

  effectManager: EffectManager

  constructor(obj: IMobConstructorObj) {
    const mobData = Mob.getMobData(obj.mobDataId)

    super({
      id: uuidv4(),
      displayedName: mobData.displayedName,
      renderGameObjectId: mobData.renderGameObjectId,
      goCategory: 'mob',
    })

    this.mobDataId = obj.mobDataId

    this.level = obj.level
    this.rangeType = mobData.rangeType
    this.behavior = mobData.behavior

    this.goalDirection = this.direction

    this.effectManager = new EffectManager(this)

    this.spawn()
  }

  static getMobData(id: string): MobData {
    return allMobData[id]
  }

  recalculateStats() {
    const mobData = Mob.getMobData(this.mobDataId)
    const { statMultipliers } = mobData

    allMobStatKeys.forEach((statKey) => {
      // base stat
      this[statKey] = baseMobStats[statKey]

      // scale certain stats with mob level
      if (statKey === 'healthPoints' || statKey === 'attackPower') {
        this[statKey] += levelScalingStats[statKey] * this.level
      }

      // multiply with type multiplier (so that all mobs don't have exactly the same stats)
      if (statMultipliers[statKey] !== undefined) {
        this[statKey] *= statMultipliers[statKey] as number
      }
    })

    if (this.currentHealth > this.healthPoints) {
      this.currentHealth = this.healthPoints
    }
  }

  onUpdate(setTrigger: ISetTrigger): void {
    this.move(setTrigger)

    setTrigger(() => {
      if (
        this.rangeType === 'ranged' &&
        this.target?.type === 'attack' &&
        Date.now() > this.nextSidewaysDirectionChangeTimestamp
      ) {
        this.rangedSideWaysDirection =
          this.rangedSideWaysDirection === 'positive' ? 'negative' : 'positive'
        this.nextSidewaysDirectionChangeTimestamp = Date.now() + randomBetween(1000, 3000)
      }
    }, 10)

    setTrigger(() => {
      if (this.behavior === 'agressive' && !this.target) {
        this.lookForTarget()
      }
    }, 5)

    setTrigger(() => {
      if (this.target) {
        this.handleLoseTarget()
      }
    }, 5)

    if (this.target?.type === 'attack') {
      this.rotateTowardsTarget()
      this.attackTarget()
    } else if (this.target?.type === 'escape') {
      this.rotateTowardsTarget(true)
    }

    setTrigger(() => {
      if (!this.target) {
        const ROTATION_INCREMENT = Math.PI / 6
        this.goalDirection += Math.random() > 0.5 ? ROTATION_INCREMENT : ROTATION_INCREMENT
        this.goalDirection = this.constrainDirection(this.goalDirection)
      }
    }, 150)

    this.rotateTowardsGoalDirection()
    this.effectManager.handleEffects()
  }

  spawn() {
    const { mapSize } = gameManager

    this.position = new Vector2(
      (0.25 + Math.random() * 0.5) * mapSize,
      (0.25 + Math.random() * 0.5) * mapSize
    )
    this.velocity = Vector2.empty()
    this.direction = 0
    this.goalDirection = 0

    this.recalculateStats()
    this.currentHealth = this.healthPoints
    this.oldHealth = null
    this.healthChangedTimestamp = 0

    this.isAlive = true

    this.animation = null
    this.floatingInfo = {}
    this.debugInfo = {}

    this.effectManager.clearEffects()
    this.target = null
  }

  onDamageTaken(damageAmount: number, invokedBy?: GameObject): void {
    if (invokedBy && this.behavior === 'defensive' && !this.target) {
      this.target = {
        gameObjectId: invokedBy.id,
        type: 'attack',
      }
    }

    if (invokedBy && this.behavior === 'passive' && !this.target) {
      this.target = {
        gameObjectId: invokedBy.id,
        type: 'escape',
      }
    }
  }

  onDeath(invokedBy?: GameObject): void {
    const { mobs } = gameManager

    setTimeout(() => {
      if (mobs[this.id]) {
        delete mobs[this.id]
      }
    }, DEATH_ANIMATION_DURATION)

    if (invokedBy?.goCategory === 'player') {
      this.createDrop(invokedBy as Player)
    }
  }

  createDrop(player: Player) {
    // TODO: Later on I want to create drops on the ground just like in Florr
    const randomItemIndex = randomBetween(0, allDropableItems.length - 1)
    const item = allDropableItems[randomItemIndex]

    const upgradeLevel = randomBetween(0, 10) // later on create algorhitm for this
    player.itemManager.addEquipItem({
      itemId: item.itemId,
      upgradeLevel,
    })

    player.addFloatingInfo({
      type: 'info',
      value: `${item.itemId} +${upgradeLevel}`,
    })
  }

  move(setTrigger: ISetTrigger) {
    if (!this.isAlive || this.effectManager.effects.currentStunId) {
      return
    }

    const { tickRate } = gameManager
    let speed = this.movementSpeed / tickRate

    if (!this.target) {
      speed *= 0.25
    } else if (this.rangeType === 'ranged' && this.target.type === 'attack') {
      speed *= 0.5
    }

    if (this.effectManager.effects.currentSlowId) {
      speed *= 1 - this.effectManager.effects.slows[this.effectManager.effects.currentSlowId].amount
    }

    if (this.rangeType === 'ranged' && this.target?.type === 'attack') {
      const dirDiff = Math.sin(this.direction - this.goalDirection)
      if (dirDiff < 0.05) {
        const increment = this.rangedSideWaysDirection === 'positive' ? Math.PI / 2 : -Math.PI / 2

        this.position.x += Math.cos(this.direction + increment) * speed
        this.position.y += Math.sin(this.direction + increment) * speed
      } else {
        this.position.x += Math.cos(this.direction) * speed
        this.position.y += Math.sin(this.direction) * speed
      }
    } else {
      this.position.x += Math.cos(this.direction) * speed
      this.position.y += Math.sin(this.direction) * speed
    }

    const sideTriggered = this.detectMapBoundaries()

    if (sideTriggered !== 'none' && !this.target) {
      setTrigger(() => {
        this.goalDirection += Math.PI / 2
      }, 30)
    }
  }

  constrainDirection(direction: number): number {
    return ((direction + Math.PI) % (2 * Math.PI)) - Math.PI
  }

  attackTarget() {
    if (
      !this.isAlive ||
      this.effectManager.effects.currentStunId ||
      Date.now() < this.nextAttackAvailableTimestamp
    ) {
      return
    }

    const { players } = gameManager

    const targetObject = players[this.target?.gameObjectId ?? '']

    if (!targetObject) {
      return
    }

    if (this.rangeType === 'melee' && !circleCollision(this, targetObject)) {
      return
    }

    if (this.rangeType === 'ranged') {
      this.invokeProjectile(targetObject)
    } else {
      // let damage = this.attackPower
      let damage = 0

      // TODO: these should be unified and handled somewhere else
      const currentEquippedItem = targetObject.itemManager.getCurrentEquippedActionBarItem()
      // if (currentEquippedItem instanceof BlockItem) {
      //   damage = currentEquippedItem.determineBlockAndCalculateDamage(targetObject, this, damage)
      // }

      targetObject.receiveDamage(damage)
    }

    const BASE_ATTACK_COOLDOWN = 500 // TODO: come up with some other way
    this.nextAttackAvailableTimestamp = Date.now() + BASE_ATTACK_COOLDOWN / this.attackSpeed
  }

  invokeProjectile(target: Player) {
    const dirDiff = Math.sin(this.direction - this.goalDirection)
    if (dirDiff > 0.05) {
      return
    }

    const { projectiles } = gameManager

    const toAdd = new Vector2(
      Math.cos(this.direction) * this.size * 1.5,
      Math.sin(this.direction) * this.size * 1.5
    )

    const projectilePosition = Vector2.add(this.position, toAdd)

    // const projectileId = uuidv4()
    // projectiles[projectileId] = new Projectile({
    //   id: projectileId,
    //   projectileType: // should be just id, not objct,
    //   invokedBy: this,
    //   position: projectilePosition, // calc correc pos,
    //   direction: this.direction,
    //   damageAmount: {
    //     flat: this.attackPower,
    //   },
    // })
  }

  rotateTowardsGoalDirection() {
    if (this.effectManager.effects.currentStunId || this.direction == this.goalDirection) {
      return
    }

    const { tickRate } = gameManager

    const rotationSpeed = 3 / tickRate
    const diff = Math.sin(this.direction - this.goalDirection)

    if (diff < 0) {
      const nextDiff = Math.sin(this.direction + rotationSpeed - this.goalDirection)
      this.direction = nextDiff < 0 ? this.direction + rotationSpeed : this.goalDirection
      return
    }

    const nextDiff = Math.sin(this.direction - rotationSpeed - this.goalDirection)
    this.direction = nextDiff > 0 ? this.direction - rotationSpeed : this.goalDirection
  }

  rotateTowardsTarget(rotateOtherWay?: boolean) {
    const { players } = gameManager

    const targetObject = players[this.target?.gameObjectId ?? '']

    if (!targetObject) {
      return
    }

    const dx = targetObject.position.x - this.position.x
    const dy = targetObject.position.y - this.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const unitX = dx / distance
    const unitY = dy / distance

    this.goalDirection = rotateOtherWay ? Math.atan2(-unitY, -unitX) : Math.atan2(unitY, unitX)
  }

  lookForTarget() {
    const { players } = gameManager

    const alivePlayers = Object.values(players).filter((player) => player.isAlive)
    const player = alivePlayers.find((player) => {
      const distance = Math.sqrt(
        Math.pow(player.position.x - this.position.x, 2) +
          Math.pow(player.position.y - this.position.y, 2)
      )

      return distance <= MOB_AGRESSIVE_RANGE
    })

    if (player) {
      this.target = {
        gameObjectId: player.id,
        type: 'attack',
      }
    }
  }

  handleLoseTarget() {
    const { players } = gameManager

    const player = players[this.target?.gameObjectId ?? '']

    if (!player || !player.isAlive) {
      this.target = null
      return
    }

    const distance = Math.sqrt(
      Math.pow(player.position.x - this.position.x, 2) +
        Math.pow(player.position.y - this.position.y, 2)
    )

    const maxRangeMultiplier = this.rangeType === 'ranged' ? 3 : 1.5

    if (distance > MOB_AGRESSIVE_RANGE * maxRangeMultiplier) {
      this.target = null
    }
  }

  serializeForUpdate(): IMobSerialized {
    return {
      id: this.id,
      renderGameObjectId: this.renderGameObjectId,
      displayedName: this.displayedName,
      goCategory: this.goCategory,
      position: this.position,
      direction: this.direction,
      size: this.size,
      level: this.level,
      healthPoints: this.healthPoints,
      currentHealth: this.currentHealth,
      oldHealth: this.oldHealth,
      healthChangedTimestamp: this.healthChangedTimestamp,
      isAlive: this.isAlive,
      animation: this.animation,
      floatingInfo: this.floatingInfo,
      debugInfo: this.debugInfo,
      effects: this.effectManager.effects,
    }
  }
}
