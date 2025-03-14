import { IVector2 } from './utils'

export type IGameObjectRenderProperties = any

export interface IGameObjectSerialized {
  id: string
  renderGameObjectId: string
  displayedName: string
  goCategory: IGoCategory

  position: IVector2
  direction: number

  healthPoints: number
  currentHealth: number
  oldHealth: number | null
  healthChangedTimestamp: number

  size: number

  isAlive: boolean

  animation: IAnimation | null
  floatingInfo: Record<string, IFloatingInfo>
  debugInfo: Record<string, string>
}

export type IGoCategory = 'player' | 'mob' | 'projectile'

export interface IAnimation {
  id: string
  createdAt: number
  name: string
  item?: string
  combo?: number
  duration: number
  repeat?: boolean
}

export interface IFloatingInfo {
  id: string
  createdAt: number
  type: 'damage' | 'heal' | 'info'
  value: string | number
}
