import { v4 as uuidv4 } from 'uuid'
import { gameManager } from '../server'
import { roundToRandom } from '../utils/utils'
import TickEffect, { ITickEffectConstructorObj } from './tickEffect'
import Player from '../player/player'
import Mob from '../mob/mob'
import { IAmount, IOvertimeDamage } from 'riftz-shared'

export type IOvertimeDamageConstructorObj = Omit<
  ITickEffectConstructorObj,
  'effectType' | 'displayedText'
> & {
  damagePerTick: IAmount
}

class OvertimeDamage extends TickEffect implements IOvertimeDamage {
  damagePerTick: IAmount

  constructor(obj: IOvertimeDamageConstructorObj) {
    super({
      ...obj,
      displayedText: 'Overtime Damage',
      effectType: 'overtime-damage',
    })
    this.damagePerTick = obj.damagePerTick
  }

  trigger(holder: Player | Mob): boolean {
    const invokedBy = gameManager.findInvokedBy(this.invokedById)

    if (!invokedBy) {
      return true
    }

    let damage =
      invokedBy instanceof Player || invokedBy instanceof Mob
        ? /*invokedBy.calculateAmount(this.damagePerTick) */ 5
        : 0
    damage = roundToRandom(damage)

    holder.receiveDamage(damage, invokedBy)
    return false
  }
}

export default OvertimeDamage
