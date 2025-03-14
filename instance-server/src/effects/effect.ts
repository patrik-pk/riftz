import { v4 as uuidv4 } from 'uuid'
import Player from '../player/player'
import Mob from '../mob/mob'
import { EffectType, IEffect } from 'riftz-shared'

export type IEffectConstructorObj = Pick<IEffect, 'invokedById' | 'displayedText' | 'effectType'>

abstract class Effect implements IEffect {
  id: string = uuidv4()
  invokedById: string
  displayedText: string
  effectType: EffectType

  constructor(obj: IEffectConstructorObj) {
    this.invokedById = obj.invokedById
    this.displayedText = obj.displayedText
    this.effectType = obj.effectType
  }

  abstract handle(holder: Player | Mob): boolean
}

export default Effect
