import Effect, { IEffectConstructorObj } from './effect'
import Mob from '../mob/mob'
import Player from '../player/player'
import { ITimeoutEffect } from 'riftz-shared'

export type ITimeoutEffectConstructorObj = IEffectConstructorObj & Pick<ITimeoutEffect, 'duration'>

abstract class TimeoutEffect extends Effect implements ITimeoutEffect {
  createdAt: number
  duration: number
  endsAt: number

  constructor(obj: ITimeoutEffectConstructorObj) {
    super(obj)
    this.createdAt = Date.now()
    this.duration = obj.duration
    this.endsAt = this.createdAt + this.duration
  }

  handle(holder: Player | Mob) {
    if (!holder.isAlive) {
      return true
    }

    if (Date.now() >= this.endsAt) {
      return true
    }

    return false
  }
}

export default TimeoutEffect
