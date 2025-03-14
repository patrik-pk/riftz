import {
  IDetermingRenderItemData,
  IPartAssets,
  Icon,
  InstantiationClass,
  ItemSlotKey,
  ItemType,
} from 'riftz-shared'
import Player from '../player/player'

interface IShieldConstructorObj extends IDetermingRenderItemData {
  player: Player
  uniqueId: string
  upgradeLevel: number
}

export class Shield implements IDetermingRenderItemData {
  player: Player

  uniqueId: string
  itemId: string
  displayedName: string
  icon: Icon
  itemType: ItemType = 'melee-weapon'
  slot: ItemSlotKey = 'secondaryWeapon'
  instantiationClass: InstantiationClass = 'shield'

  partAssets: IPartAssets
  renderGameObjectId: string

  upgradeLevel: number

  constructor(obj: IShieldConstructorObj) {
    this.player = obj.player
    this.uniqueId = obj.uniqueId
    this.itemId = obj.itemId
    this.displayedName = obj.displayedName
    this.icon = obj.icon

    this.partAssets = obj.partAssets
    this.renderGameObjectId = obj.renderGameObjectId

    this.upgradeLevel = obj.upgradeLevel
  }

  serialize() {
    return { ...this, player: null }
  }
}
