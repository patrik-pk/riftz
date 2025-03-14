import { IVector2 } from '../game/vector2'

export type ISetTrigger = (callback: Function, tickAmount: number) => void

export interface IHitObject {
  position: IVector2
  size: number
}

export interface IServerInfo {
  mapSize: number
}

export interface IPlayerMovement {
  vertical: number
  horizontal: number
}

export interface IMessage {
  type: string
  message: string
}
