import { IEffect, IEffects } from './effectTypes'
import { IGameObjectSerialized } from './gameObjectTypes'

export interface IPlayerSerialized extends IGameObjectSerialized {
  level: ILevel
  actionTrigger: IActionTrigger | null
  effects: IEffects
  currentItemId: string

  renderParts: {
    armorId: string | null
    accessoryId: string | null
    wingsId: string | null
  }
}

export interface IUpdateMe extends IPlayerStats {
  id: string
  disableInterpolation: boolean
}

export interface ILevel {
  currentLevel: number
  currentXp: number
  totalXp: number
  xpToNextLevel: number
}

export interface IActionTrigger {
  createdTimestamp: number
  duration: number
  triggerTimestamp: number
  endsAtTimestamp: number
  effect?: IEffect
  renderBar: boolean
  triggerCallback?: (...args: any) => void
  ability?: {
    itemId: string
    triggerCallback: (...args: any) => void
  }
}

export const allPlayerStatKeys = [
  'healthPoints',
  'attackPower',
  'weight',
  'size',
  'attackSpeed',
  'movementSpeed',
  'cooldownReduction',
] as const

export type IPlayerStatKey = (typeof allPlayerStatKeys)[number]

export type IPlayerStats = Record<IPlayerStatKey, number>

export const basePlayerStats: IPlayerStats = {
  healthPoints: 400,
  attackPower: 100,
  weight: 300,
  size: 50,
  movementSpeed: 400,
  attackSpeed: 1,
  cooldownReduction: 0,
}
