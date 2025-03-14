import { IAmount } from './effectTypes'

export type InstantiationClass = 'melee-weapon' | 'shield' | 'ability'

// Icon can either have static url or it can have some specific
interface IconUrl {
  type: 'url'
  path: string
}

interface IconSpecific {
  type: 'specific'
  id: string
}

export type Icon = IconUrl | IconSpecific

export const itemStatKey = [
  'strength',
  'dexterity',
  'intelligence',
  'wisdom',
  'healthPoints',
  'attackSpeed',
  'cooldownReduction',
  'movementSpeed',
  'size',
  'weight',
] as const

export type ItemStatKey = (typeof itemStatKey)[number]

export type IItemDataStats = Partial<Record<ItemStatKey, number>>

// Base item data
export interface IItemData {
  itemId: string
  displayedName: string
  slot: ItemSlotKey
  icon: Icon
  stats?: IItemDataStats
  availableSpellIds?: string[]
  canBeDropped?: boolean
}

// Item that adds part to the rendered game object
export interface IRenderItemData extends IItemData {
  slot: Extract<ItemSlotKey, 'armor' | 'wings' | 'accessory'> // specify slots that this interface applies to
  assetPath: string
}

export type IPartAssets = Record<string, string> // key = partId, value = asset path

export interface IDetermingRenderItemData extends IItemData {
  renderGameObjectId: string // id of renderer object
  partAssets: IPartAssets
  instantiationClass: InstantiationClass
}

// Melee weapon data
export interface IMeleeWeaponItemData extends IDetermingRenderItemData {
  assetPath: string
  movementSpeedMultiplier: number

  instantiationClass: Extract<InstantiationClass, 'melee-weapon'>

  baseUseDuration: number
  useTriggerRatio: number

  hitRadius: number
  hitDistanceMultiplier: number
  comboAmount: number
  baseDamageAmount: IAmount
}

// Interface only for items with functionality (items in actions bar),
// items such as materials or armor that have no functionality don't need to be instantiated.
// Examples of items that will be instantiated: weapons (melee, ranged, shield), spells, later buildings
export interface IItem {
  uniqueId: string // uuid
  itemId: string // id of item, e.g. "daggers"
  displayedName: string
  icon: Icon
  itemType: ItemType
  upgradeLevel: number
}

export interface IMeleeWeapon extends IItem {
  assetPath: string
  renderGameObjectId: string

  baseUseDuration: number
  useTriggerRatio: number
  triggerTimestamps: ITriggerItemTimestamps

  currentCombo: number
  comboAmount: number
  hitRadius: number
  hitDistanceMultiplier: number
  damageAmount: IAmount
}

export interface ITriggerItemTimestamps {
  start: number
  trigger: number
  finish: number
}

export type SerializedInstanceItem = IMeleeWeapon | IItem // shield
export type ActionBarItemSlot =
  | 'primaryWeapon'
  | 'secondaryWeapon'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'

export type IActionBarItems<T = SerializedInstanceItem> = Record<ActionBarItemSlot, T | null>

export interface IMaterialItem {
  amount: number
}

export interface IEquipItem {
  itemId: string
  upgradeLevel: number
}

export interface IInventoryItems {
  materials: Record<string, IMaterialItem> // key = material item data id
  equip: Record<string, IEquipItem> // key = unique id, itemId property = equip item data id
}

export type EquippedItemId = string | null // string represents uniqueId of equip item in inventoryItems

export type ItemSlotKey =
  | 'primaryWeapon'
  | 'secondaryWeapon'
  | 'armor'
  | 'accessory'
  | 'wings'
  | 'necklace'
  | 'belt'
  | 'ring'

export type IEquipedItemsIds = Record<ItemSlotKey, EquippedItemId>

export type ItemType = 'melee-weapon' | 'shield'
