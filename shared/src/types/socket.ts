import { IAmount } from './effectTypes'
import { IGameObjectSerialized } from './gameObjectTypes'
import { ItemSlotKey, IActionBarItems, IEquipedItemsIds, IInventoryItems, IItem } from './itemTypes'
import { ILevel, IUpdateMe } from './playerTypes'
import { IVector2 } from './utils'

export interface IPrepareUserForConnectionBody {
  connectionId: string
  userId: string
  inventoryItems: IInventoryItems
  equippedItems: IEquipedItemsIds
}

export interface InstanceServerToClientEvents {
  serverInfo: (serverInfo: IServerInfo) => void
  actionBarItems: (items: IActionBarItems) => void
  inventoryItems: (items: IInventoryItems) => void
  equippedItemsIds: (items: IEquipedItemsIds) => void
  isAlive: (isAlive: boolean) => void
  level: (level: ILevel) => void
  update: (update: IUpdate) => void
  upgradeItemResponse: (didUpgradeSucceed: boolean) => void
}

export interface ClientToInstanceServerEvents {
  startPlaying: (username?: string) => void
  spawn: () => void
  setPlayerDirection: (direction: number) => void
  setPlayerMovement: (movevement: IPlayerMovement) => void
  useItem: (uniqeItemId: string | number) => void
  setIsUsingItem: (bool: boolean) => void
  chooseItem: (itemId: string | null) => void
  sendMessage: (message: IMessage) => void
  testTrigger: () => void
  equipItem: (uniqueId: string) => void
  unequipItem: (slotKey: ItemSlotKey) => void
  upgradeItem: (upgradeItemId: string, itemIdsToUpgradeWith: string[]) => void
  devAddXp: (amount: number) => void
}

export interface IUpdate {
  timestamp: number
  camera: IVector2
  me: IUpdateMe
  gameObjects: IGameObjectSerialized[]
  hits: IHitObject[]
  messages: IMessage[]
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

export interface IHitObject {
  position: IVector2
  size: number
}
