import { IMeleeWeaponItemData } from '../../types/itemTypes'

export const hands: IMeleeWeaponItemData = {
  itemId: 'hands',
  assetPath: '',
  displayedName: 'Hands',
  partAssets: {},
  icon: {
    type: 'url',
    path: 'hands.png-idk',
  },
  instantiationClass: 'melee-weapon',
  renderGameObjectId: 'player-base',
  slot: 'primaryWeapon',
  movementSpeedMultiplier: 1,
  baseDamageAmount: {
    flat: 50,
  },
  baseUseDuration: 500,
  useTriggerRatio: 0.5,
  comboAmount: 2,
  hitDistanceMultiplier: 1.5,
  hitRadius: 40,
  canBeDropped: false,
}
