import { IMeleeWeaponItemData } from '../../types/itemTypes'

export const daggers: IMeleeWeaponItemData = {
  itemId: 'daggers',
  displayedName: 'Daggers',
  assetPath: 'this-does-nothing',
  partAssets: {
    'dagger-left': 'items/diamond-dagger.png',
    'dagger-right': 'items/diamond-dagger.png',
  },
  icon: {
    type: 'specific',
    id: 'daggers',
  },
  instantiationClass: 'melee-weapon',
  renderGameObjectId: 'player-daggers',
  slot: 'primaryWeapon',
  movementSpeedMultiplier: 1,
  baseDamageAmount: {
    flat: 50,
  },
  baseUseDuration: 400,
  useTriggerRatio: 0.5,
  comboAmount: 2,
  hitDistanceMultiplier: 1.8,
  hitRadius: 50,
  stats: {
    healthPoints: 100,
  },
  availableSpellIds: ['test-ability'],
  canBeDropped: true,
}
