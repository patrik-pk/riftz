import { IEffects } from './effectTypes'
import { IGameObjectSerialized } from './gameObjectTypes'

export interface IMobSerialized extends IGameObjectSerialized {
  effects: IEffects
  level: number
}

export interface MobStats {
  healthPoints: number // scales with level
  attackPower: number // scales with level
  weight: number
  size: number
  attackSpeed: number
  movementSpeed: number
}

export type MobBehavior = 'agressive' | 'defensive' | 'passive'
export type RangeType = 'melee' | 'ranged'

export type MobStatKey = keyof MobStats

export const allMobStatKeys: MobStatKey[] = [
  'healthPoints',
  'attackPower',
  'weight',
  'size',
  'attackSpeed',
  'movementSpeed',
]

export const baseMobStats: MobStats = {
  healthPoints: 500,
  attackPower: 100,
  weight: 400,
  size: 70,
  movementSpeed: 350,
  attackSpeed: 1,
}

export const levelScalingStats: Pick<MobStats, 'healthPoints' | 'attackPower'> = {
  healthPoints: 10,
  attackPower: 5,
}

export interface MobData {
  displayedName: string
  renderGameObjectId: string
  behavior: MobBehavior
  rangeType: RangeType
  statMultipliers: Partial<MobStats>
}

export const allMobData: Record<string, MobData> = {
  'test-mob': {
    displayedName: 'Test Mob',
    renderGameObjectId: 'test-mob',
    behavior: 'defensive',
    rangeType: 'melee',
    statMultipliers: {},
  },
}
