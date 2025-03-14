import { v4 as uuidv4 } from 'uuid'
import { gameManager } from '../server'
import { circleCollision } from '../utils/collisions'
import OvertimeDamage from '../effects/overtimeDamage'
import { Slow } from '../effects/slow'
import { Stun } from '../effects/stun'
import Player from '../player/player'
import Vector2 from '../utils/vector2'
import Mob from '../mob/mob'
import {
  IAmount,
  IItem,
  Icon,
  IHitObject,
  IMeleeWeapon,
  ITriggerItemTimestamps,
} from 'riftz-shared'

type ItemType = 'melee-weapon'

type IMeleeWeaponConstructorObj = Omit<
  IMeleeWeapon,
  'triggerTimestamps' | 'itemType' | 'currentCombo'
> & {}

export class MeleeWeapon implements IMeleeWeapon {
  player: Player

  uniqueId: string
  itemId: string
  displayedName: string
  icon: Icon
  itemType: ItemType = 'melee-weapon'

  assetPath: string
  renderGameObjectId: string

  baseUseDuration: number
  useTriggerRatio: number
  triggerTimestamps: ITriggerItemTimestamps

  currentCombo: number = 0
  comboAmount: number
  hitRadius: number
  hitDistanceMultiplier: number
  damageAmount: IAmount

  upgradeLevel: number

  constructor(obj: IMeleeWeaponConstructorObj, player: Player) {
    this.player = player

    this.uniqueId = obj.uniqueId
    this.itemId = obj.itemId
    this.displayedName = obj.displayedName
    this.icon = obj.icon

    this.assetPath = obj.assetPath
    this.renderGameObjectId = obj.renderGameObjectId

    this.baseUseDuration = obj.baseUseDuration
    this.useTriggerRatio = obj.useTriggerRatio
    this.triggerTimestamps = {
      start: 0,
      finish: 0,
      trigger: 0,
    }

    this.comboAmount = obj.comboAmount
    this.hitRadius = obj.hitRadius
    this.hitDistanceMultiplier = obj.hitDistanceMultiplier
    this.damageAmount = obj.damageAmount

    this.upgradeLevel = obj.upgradeLevel
  }

  serialize(): IMeleeWeapon {
    return {
      uniqueId: this.uniqueId,
      itemId: this.itemId,
      displayedName: this.displayedName,
      icon: this.icon,
      itemType: this.itemType,

      assetPath: this.assetPath,
      renderGameObjectId: this.renderGameObjectId,

      baseUseDuration: this.baseUseDuration,
      useTriggerRatio: this.useTriggerRatio,
      triggerTimestamps: this.triggerTimestamps,

      currentCombo: this.currentCombo,
      comboAmount: this.comboAmount,
      hitRadius: this.hitRadius,
      hitDistanceMultiplier: this.hitDistanceMultiplier,
      damageAmount: this.damageAmount,

      upgradeLevel: this.upgradeLevel,
    }
  }

  createTrigger(player: Player) {
    const now = Date.now()
    const canTrigger = now > this.triggerTimestamps.finish

    if (!canTrigger) {
      return
    }

    const useTriggerRatio = this.useTriggerRatio
    let useDuration = this.baseUseDuration
    let useTrigger = useDuration * useTriggerRatio

    useDuration /= player.attackSpeed
    useTrigger /= player.attackSpeed

    this.triggerTimestamps = {
      start: now,
      trigger: now + useTrigger,
      finish: now + useDuration,
    }

    player.itemManager.createActionTrigger({
      duration: useDuration,
      triggerRatio: useTriggerRatio,
      renderBar: true,
      triggerCallback: this.handleTrigger,
    })

    player.addAnimation({
      id: uuidv4(),
      name: `attack-${this.currentCombo}`,
      createdAt: now,
      duration: useDuration,
    })

    this.currentCombo = this.currentCombo >= this.comboAmount - 1 ? 0 : this.currentCombo + 1
    if (this.itemId !== 'hands') {
      player.itemManager.sendActionBarItems()
    }
  }

  handleTrigger(invokedBy: Player): void {
    const { hits } = gameManager

    const distance = this.hitDistanceMultiplier * invokedBy.size
    const hitPosition = new Vector2(
      invokedBy.position.x + distance * Math.cos(invokedBy.direction),
      invokedBy.position.y + distance * Math.sin(invokedBy.direction)
    )

    const hitObject: IHitObject = {
      position: hitPosition,
      size: this.hitRadius,
    }

    // only for debug purposes
    hits.push(hitObject)

    const gameObjects = [...gameManager.getAlivePlayers(), ...gameManager.getAliveMobs()]

    // check for hit collision with all game objects
    for (let j = 0; j < gameObjects.length; j++) {
      const go = gameObjects[j]

      if (invokedBy.id === go.id) {
        continue
      }

      if (circleCollision(hitObject, go)) {
        let damage = /*invokedBy.calculateAmount(this.damageAmount)*/ 200
        // for (const attackEnhancement of Object.values(
        //   invokedBy.effects.attackEnhancements
        // )) {
        //   damage += invokedBy.calculateAmount(attackEnhancement.amount)
        // }

        // if (go instanceof Player) {
        //   const currentEquippedItem = go.getCurrentEquippedActionBarItem()
        //   if (currentEquippedItem instanceof BlockItem) {
        //     damage = currentEquippedItem.determineBlockAndCalculateDamage(go, invokedBy, damage)
        //   }
        // }

        // damage += this.calculateInstantAttackEnhancementDamage()

        go.receiveDamage(damage, invokedBy)

        if (
          (go instanceof Player || go instanceof Mob) &&
          invokedBy.itemManager.actionTrigger?.effect
        ) {
          const effectType = invokedBy.itemManager.actionTrigger.effect.effectType
          if (effectType === 'slow') {
            go.effectManager.addSlow(invokedBy.itemManager.actionTrigger.effect as Slow)
          }
          if (effectType === 'stun') {
            go.effectManager.addStun(invokedBy.itemManager.actionTrigger.effect as Stun)
          }
          if (effectType === 'overtime-damage') {
            go.effectManager.addOvertimeDamage(
              invokedBy.itemManager.actionTrigger.effect as OvertimeDamage
            )
          }
        }
      }
    }
  }
}
