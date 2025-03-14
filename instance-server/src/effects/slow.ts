import TimeoutEffect, { ITimeoutEffectConstructorObj } from './timeoutEffect'
import { gameManager } from '../server'
import Player from '../player/player'
import Mob from '../mob/mob'
import { IAmount, ISlow } from 'riftz-shared'

export type IStunConstructorObj = Omit<
  ITimeoutEffectConstructorObj,
  'effectType' | 'displayedText'
> & {
  amount: IAmount // constructor takes IAmount which gets recalculated into regular number and stored in Slow instance
}

export class Slow extends TimeoutEffect implements ISlow {
  amount: number

  constructor(obj: IStunConstructorObj) {
    super({
      ...obj,
      effectType: 'slow',
      displayedText: 'Slowed',
    })

    const invokedBy = gameManager.findInvokedBy(this.invokedById)
    let amount =
      invokedBy instanceof Player || invokedBy instanceof Mob
        ? /*invokedBy.calculateAmount(obj.amount)*/ 5
        : 0
    amount = Math.min(amount, 0.9)

    this.amount = amount
  }
}
