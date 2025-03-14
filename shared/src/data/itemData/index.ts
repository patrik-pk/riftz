import { IDetermingRenderItemData, IItemData, IRenderItemData } from '../../types/itemTypes'
import { daggers } from './daggers'
import { hands } from './hands'

export const armor: IRenderItemData = {
  itemId: 'armor',
  displayedName: 'Armor',
  icon: {
    type: 'url',
    path: 'items/armor-1.png',
  },
  slot: 'armor',
  assetPath: 'items/armor-1.png',
  stats: {
    healthPoints: 500,
  },
  canBeDropped: true,
}

export const wings: IRenderItemData = {
  itemId: 'wings',
  displayedName: 'Wings',
  icon: {
    type: 'url',
    path: 'items/wings-1.png',
  },
  slot: 'wings',
  assetPath: 'items/wings-1.png',
  stats: {
    healthPoints: 100,
    movementSpeed: 50,
  },
  canBeDropped: true,
}

export const accessory: IRenderItemData = {
  itemId: 'accessory',
  displayedName: 'Accessory',
  icon: {
    type: 'url',
    path: 'interface/upgrade.png',
  },
  slot: 'accessory',
  assetPath: 'interface/upgrade.png',
  stats: {
    healthPoints: 100,
    movementSpeed: 50,
  },
  canBeDropped: true,
}

export const shield: IDetermingRenderItemData = {
  itemId: 'shield',
  displayedName: 'Shield',
  instantiationClass: 'shield',
  renderGameObjectId: 'player-shield',
  partAssets: {
    shield: 'items/diamond-shield.png',
  },
  icon: {
    type: 'url',
    path: 'items/diamond-shield.png',
  },
  slot: 'secondaryWeapon',
  stats: {
    healthPoints: 100,
    movementSpeed: 50,
  },
  canBeDropped: true,
}

export const allItemsData: Record<string, IItemData> = {
  [hands.itemId]: hands,
  [daggers.itemId]: daggers,
  [armor.itemId]: armor,
  [wings.itemId]: wings,
  [accessory.itemId]: accessory,
  [shield.itemId]: shield,
}

export const getItemData = (itemId: string): IItemData | undefined => {
  return allItemsData[itemId]
}

export const allDropableItems: IItemData[] = Object.values(allItemsData).filter(
  (item) => item.canBeDropped
)
