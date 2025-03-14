import { IStun } from 'riftz-shared'
import TimeoutEffect, { ITimeoutEffectConstructorObj } from './timeoutEffect'

export type IStunConstructorObj = Omit<ITimeoutEffectConstructorObj, 'effectType' | 'displayedText'>

export class Stun extends TimeoutEffect implements IStun {
  constructor(obj: IStunConstructorObj) {
    super({
      ...obj,
      effectType: 'stun',
      displayedText: 'Stunned',
    })
  }
}
