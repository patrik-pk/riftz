import Effect, { IEffectConstructorObj } from './effect'
import Player from '../player/player'
import Mob from '../mob/mob'
import { ITickEffect } from 'riftz-shared'

export type ITickEffectConstructorObj = IEffectConstructorObj &
  Pick<ITickEffect, 'tickAmount' | 'ticksPerTrigger'>

abstract class TickEffect extends Effect implements ITickEffect {
  currentTick: number = 0
  tickAmount: number
  ticksPerTrigger: number
  totalTickAmount: number

  constructor(obj: ITickEffectConstructorObj) {
    super(obj)
    this.tickAmount = obj.tickAmount
    this.ticksPerTrigger = obj.ticksPerTrigger
    this.totalTickAmount = obj.tickAmount * obj.ticksPerTrigger
  }

  abstract trigger(holder: Player | Mob): boolean

  handle(holder: Player | Mob) {
    if (!holder.isAlive) {
      return true
    }

    this.currentTick += 1

    if (this.currentTick % this.ticksPerTrigger !== 0) {
      return false
    }

    const shouldDelete = this.trigger(holder)
    if (shouldDelete) {
      return true
    }

    if (this.currentTick >= this.totalTickAmount - 1) {
      return true
    }

    return false
  }
}

export default TickEffect
