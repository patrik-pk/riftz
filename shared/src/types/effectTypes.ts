import { IPlayerStats } from './playerTypes'

export interface IEffects<Stun = IStun, Slow = ISlow, OvertimeDamage = IOvertimeDamage> {
  stuns: Record<string, Stun>
  slows: Record<string, Slow>
  overtimeDamage: Record<string, OvertimeDamage>
  currentSlowId: string | null
  currentStunId: string | null
}

export type EffectType = 'stun' | 'slow' | 'overtime-damage' | 'attack-enhancement'

export interface IEffect {
  id: string
  invokedById: string
  displayedText: string
  effectType: EffectType
}

export interface ITimeoutEffect extends IEffect {
  createdAt: number
  endsAt: number
  duration: number
}

export interface ITickEffect extends IEffect {
  currentTick: number
  tickAmount: number
  ticksPerTrigger: number
}

export interface IAttackEnhancement extends ITimeoutEffect {
  amount: IAmount
}

export interface IOvertimeDamage extends ITickEffect {
  damagePerTick: IAmount
}

export interface IStun extends ITimeoutEffect {}

export interface ISlow extends ITimeoutEffect {
  amount: number
}

export type IAmount = Partial<Record<keyof IPlayerStats | 'flat', number>>
