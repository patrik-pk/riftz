import { v4 as uuidv4 } from 'uuid'
import { gameManager } from '../server'
import Vector2 from '../utils/vector2'
import GameObject from '../gameObject/gameObject'
import { XP_TO_LEVEL } from '../utils/config'
import { EffectManager } from '../effects/EffectManager'
import Mob from '../mob/mob'
import { MeleeWeapon } from '../item/meleeWeapon'
import {
  ILevel,
  IPlayerSerialized,
  IActionTrigger,
  IUpdateMe,
  allPlayerStatKeys,
  basePlayerStats,
  IPrepareUserForConnectionBody,
} from 'riftz-shared'
import { ItemManager } from './itemManager'
import { ISetTrigger, PlayerSocket } from '../gameManager/gameManager'

interface IPlayerConstructorObj extends Omit<IPrepareUserForConnectionBody, 'connectionId'> {}

class Player extends GameObject {
  userId: string // user's database id

  effectManager: EffectManager
  itemManager: ItemManager

  level: ILevel

  acceleration: Vector2 = Vector2.empty()

  skillPoints: number = 0

  disableInterpolation: boolean = false

  attackPower: number = 0
  attackSpeed: number = 0
  cooldownReduction: number = 0
  movementSpeed: number = 0

  constructor(obj: IPlayerConstructorObj) {
    super({
      id: '', // id is assigned after player connects as their socket id
      renderGameObjectId: '', // changes based on currentItemId
      displayedName: '',
      goCategory: 'player',
    })

    this.userId = obj.userId

    this.size = 50
    this.weight = 300

    this.level = this.getStartingLevel()
    this.effectManager = new EffectManager(this)
    this.itemManager = new ItemManager({
      player: this,
      inventoryItems: obj.inventoryItems,
      equippedItemsIds: obj.equippedItems,
    })

    // this.stats.recalculateStats(this)
    // this.equippedItems = this.getStartingEquippedItems()

    // const firstItem = this.equippedItems[Object.keys(this.equippedItems)[0]]
    // this.currentItemId = firstItem.uniqueId
    // this.primaryWeaponId = firstItem.uniqueId
    this.itemManager.instantiateActionBarItems()
  }

  recalculateStats() {
    allPlayerStatKeys.forEach((statKey) => {
      this[statKey] = basePlayerStats[statKey]
    })
  }

  onUpdate(setTrigger: ISetTrigger): void {
    this.move()
    this.itemManager.handleActionTrigger()
    this.itemManager.handleItemUse()
    this.effectManager.handleEffects()
    this.removeOldVelocityEffects()
  }

  spawn() {
    const { mapSize } = gameManager

    this.recalculateStats()

    this.position = new Vector2(
      (0.25 + Math.random() * 0.5) * mapSize,
      (0.25 + Math.random() * 0.5) * mapSize
    )
    this.velocity = Vector2.empty()
    this.direction = 0

    this.currentHealth = this.healthPoints
    this.oldHealth = null
    this.healthChangedTimestamp = 0

    this.isAlive = true

    this.animation = null
    this.floatingInfo = {}
    this.debugInfo = {}

    this.level = this.getStartingLevel()

    this.setAcceleration(Vector2.empty())

    // const firstItem = this.equippedItems[Object.keys(this.equippedItems)[0]]
    // this.currentItemId = firstItem.uniqueId
    // this.primaryWeaponId = firstItem.uniqueId
    // this.armorId = null
    // this.accessoryId = null

    this.isAlive = true
    this.itemManager.isUsingItem = false

    this.effectManager.clearEffects()

    this.itemManager.actionTrigger = null

    // updatePossibleItemsToChoose(this)
  }

  gainXp(amount: number) {
    this.level.currentXp += amount
    let leveledUp = false

    while (this.level.currentXp >= this.level.xpToNextLevel) {
      if (this.level.currentLevel >= XP_TO_LEVEL.length - 1) break

      this.levelUp()
      leveledUp = true
    }

    this.updateLevel()
  }

  levelUp() {
    this.level.currentXp -= this.level.xpToNextLevel
    this.level.currentLevel += 1
    this.level.xpToNextLevel = XP_TO_LEVEL[this.level.currentLevel + 1] || 0
    this.skillPoints += 1
  }

  onKill(go: GameObject): void {
    if (go instanceof Player || go instanceof Mob) {
      this.gainXp(100)
    }
  }

  onIsAliveChanged(): void {
    const socket = this.getSocket()
    socket?.emit('isAlive', this.isAlive)
  }

  updateLevel(): void {
    const socket = this.getSocket()
    socket?.emit('level', this.level)
  }

  public getSocket(): PlayerSocket | undefined {
    return gameManager.sockets[this.id]
  }

  setDirection(direction: number) {
    if (this.effectManager.effects.currentStunId) {
      return
    }

    this.direction = direction
  }

  setAcceleration(acceleration: Vector2) {
    this.acceleration = acceleration
  }

  move() {
    if (!this.isAlive || this.effectManager.effects.currentStunId) {
      return
    }

    const { tickRate } = gameManager

    let speed = this.movementSpeed / tickRate

    const currentItemId = this.itemManager.getCurrentEquippedActionBarItem()

    // speed *= currentItemId.movementSpeedMultiplier

    if (this.effectManager.effects.currentSlowId) {
      speed *= 1 - this.effectManager.effects.slows[this.effectManager.effects.currentSlowId].amount
    }

    const preventMovement = this.calculateVelocity()

    const moveDirection = new Vector2(this.velocity.x, this.velocity.y)

    if (!preventMovement) {
      moveDirection.add(this.acceleration)
    }

    moveDirection.multiply(speed)
    this.position = Vector2.add(this.position, moveDirection)

    this.detectMapBoundaries()
  }

  // useOrSwapItem(uniqueItemId: string) {
  //   const item = this.equippedItems[uniqueItemId]

  //   if (!item) {
  //     return
  //   }

  //   if (this.effectManager.effects.currentStunId /*&& !item.canUseWhileStunned*/) {
  //     return
  //   }

  //   if (item instanceof Ability) {
  //     item.useAbility(this)
  //     return
  //   }

  //   if (!(item instanceof RenderItem)) {
  //     return
  //   }

  //   this.currentItemId = uniqueItemId

  //   this.trigger = null
  //   this.animation = null
  // }

  getMe(): IUpdateMe {
    const oldDisableInterpolation = this.disableInterpolation
    this.disableInterpolation = false

    return {
      id: this.id,
      healthPoints: this.healthPoints,
      attackPower: this.attackPower,
      attackSpeed: this.attackSpeed,
      cooldownReduction: this.cooldownReduction,
      movementSpeed: this.movementSpeed,
      weight: this.weight,
      size: this.size,
      // @ts-ignore
      disableInterpolation: oldDisableInterpolation,
    }
  }

  getStartingLevel(level: number = 0): ILevel {
    return {
      currentLevel: level,
      currentXp: 0,
      totalXp: 0,
      xpToNextLevel: XP_TO_LEVEL[level],
    }
  }

  serializeForUpdate(): IPlayerSerialized {
    return {
      id: this.id,
      renderGameObjectId: this.itemManager.getCurrentEquippedActionBarItem().renderGameObjectId,
      currentItemId: '',
      displayedName: this.displayedName,
      goCategory: this.goCategory,
      position: this.position,
      direction: this.direction,
      size: this.size,
      healthPoints: this.healthPoints,
      currentHealth: this.currentHealth,
      oldHealth: this.oldHealth,
      healthChangedTimestamp: this.healthChangedTimestamp,
      level: this.level,
      isAlive: this.isAlive,
      animation: this.animation,
      floatingInfo: this.floatingInfo,
      debugInfo: this.debugInfo,
      effects: this.effectManager.effects,
      actionTrigger: this.itemManager.actionTrigger,

      renderParts: {
        armorId:
          this.itemManager.inventoryItems.equip[this.itemManager.equippedItemsIds.armor ?? '']
            ?.itemId ?? null,
        accessoryId:
          this.itemManager.inventoryItems.equip[this.itemManager.equippedItemsIds.accessory ?? '']
            ?.itemId ?? null,
        wingsId:
          this.itemManager.inventoryItems.equip[this.itemManager.equippedItemsIds.wings ?? '']
            ?.itemId ?? null,
      },
    }
  }
}

export default Player
