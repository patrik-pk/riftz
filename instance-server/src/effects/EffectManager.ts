import OvertimeDamage from './overtimeDamage'
import { Slow } from './slow'
import { Stun } from './stun'
import Mob from '../mob/mob'
import Player from '../player/player'
import { IEffects } from 'riftz-shared'

type IEffectsClassed = IEffects<Stun, Slow, OvertimeDamage>

export class EffectManager {
  holder: Player | Mob
  effects: IEffectsClassed = EffectManager.getEmptyEffects()

  constructor(holder: Player | Mob) {
    this.holder = holder
  }

  static getEmptyEffects(): IEffectsClassed {
    return {
      stuns: {},
      slows: {},
      overtimeDamage: {},
      currentSlowId: null,
      currentStunId: null,
    }
  }

  addStun(stun: Stun) {
    this.effects.stuns[stun.id] = stun
  }

  addSlow(slow: Slow) {
    this.effects.stuns[slow.id] = slow
  }

  addOvertimeDamage(overtimeDamage: OvertimeDamage) {
    this.effects.overtimeDamage[overtimeDamage.id] = overtimeDamage
  }

  cleanseEffects() {
    this.effects.slows = {}
    this.effects.stuns = {}
    this.effects.currentSlowId = null
    this.effects.currentStunId = null
  }

  handleEffects() {
    // creating new variables instead of assinging current effects to null for more secure approach
    let currentSlowId: string | null = null
    let currentStunId: string | null = null

    for (const stunKey in this.effects.stuns) {
      const shouldDelete = this.effects.stuns[stunKey].handle(this.holder)
      if (shouldDelete) {
        delete this.effects.stuns[stunKey]
        continue
      }

      if (
        !currentStunId ||
        this.effects.stuns[stunKey].endsAt > this.effects.stuns[currentStunId].endsAt
      ) {
        currentStunId = this.effects.stuns[stunKey].id
      }
    }

    for (const slowKey in this.effects.slows) {
      const shouldDelete = this.effects.slows[slowKey].handle(this.holder)
      if (shouldDelete) {
        delete this.effects.slows[slowKey]
        continue
      }

      // if no slow OR bigger slow OR same slow and ends later
      if (
        !currentSlowId ||
        this.effects.slows[slowKey].amount > this.effects.slows[currentSlowId].amount ||
        (this.effects.slows[slowKey].amount === this.effects.slows[currentSlowId].amount &&
          this.effects.slows[slowKey].endsAt > this.effects.slows[currentSlowId].endsAt)
      ) {
        currentSlowId = this.effects.slows[slowKey].id
      }
    }

    for (const overtimeDamageKey in this.effects.overtimeDamage) {
      const shouldDelete = this.effects.overtimeDamage[overtimeDamageKey].handle(this.holder)
      if (shouldDelete) {
        delete this.effects.overtimeDamage[overtimeDamageKey]
        continue
      }
    }

    this.effects.currentSlowId = currentSlowId
    this.effects.currentStunId = currentStunId
  }

  clearEffects() {
    this.effects = EffectManager.getEmptyEffects()
  }
}
