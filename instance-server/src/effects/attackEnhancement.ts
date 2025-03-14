import { v4 as uuidv4 } from 'uuid'
import { EffectType, IAmount, IAttackEnhancement } from 'riftz-shared'

class AttackEnhancement implements IAttackEnhancement {
  id: string = uuidv4()
  invokedById: string
  amount: IAmount
  createdAt: number
  duration: number
  endsAt: number

  displayedText: string = ''
  effectType: EffectType = 'attack-enhancement'

  constructor(obj: Omit<IAttackEnhancement, 'id' | 'endsAt'>) {
    this.invokedById = obj.invokedById
    this.amount = obj.amount
    this.createdAt = obj.createdAt
    this.duration = obj.duration
    this.endsAt = this.createdAt + this.duration
  }
}

export default AttackEnhancement
