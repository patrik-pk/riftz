import { v4 as uuidv4 } from 'uuid'
import { MeleeWeapon } from '../item/meleeWeapon'
import {
  hands,
  IMeleeWeaponItemData,
  IActionTrigger,
  ActionBarItemSlot,
  IInventoryItems,
  IEquipedItemsIds,
  IActionBarItems,
  getItemData,
  ItemSlotKey,
  IDetermingRenderItemData,
  IEquipItem,
} from 'riftz-shared'
import Player from './player'
import { Shield } from '../item/shield'

type InstanceItem = MeleeWeapon | Shield

interface ItemManagerConstructorObj {
  player: Player
  inventoryItems: IInventoryItems
  equippedItemsIds: IEquipedItemsIds
}

export class ItemManager {
  private player: Player

  public inventoryItems: IInventoryItems
  public equippedItemsIds: IEquipedItemsIds // TODO: remove custom slots and later replace with other specific slots such as armor, etc.
  public actionBarItems: IActionBarItems<InstanceItem> = {
    primaryWeapon: null,
    secondaryWeapon: null,
    '0': null,
    '1': null,
    '2': null,
    '3': null,
    '4': null,
    '5': null,
  }

  public currentEquippedActionBarItemId: ActionBarItemSlot | null = null
  public instantiatedHands: MeleeWeapon

  public isUsingItem: boolean = false

  public actionTrigger: IActionTrigger | null = null

  constructor(obj: ItemManagerConstructorObj) {
    this.player = obj.player
    this.inventoryItems = obj.inventoryItems
    this.equippedItemsIds = obj.equippedItemsIds
    this.instantiatedHands = this.instantiateHands()
  }

  private serializeActionBarItems(): IActionBarItems {
    const serializedActionBarItems: IActionBarItems = {} as IActionBarItems

    Object.keys(this.actionBarItems).forEach((key) => {
      const slotKey = key as ActionBarItemSlot
      serializedActionBarItems[slotKey] = this.actionBarItems[slotKey]
        ? this.actionBarItems[slotKey]!.serialize()
        : null
    })

    return serializedActionBarItems
  }

  public sendActionBarItems() {
    const socket = this.player.getSocket()
    if (socket) {
      socket.emit('actionBarItems', this.serializeActionBarItems())
    }
  }

  public sendInventoryItems() {
    const socket = this.player.getSocket()
    if (socket) {
      socket.emit('inventoryItems', this.inventoryItems)
    }
  }

  public sendEquippedItemsIds() {
    const socket = this.player.getSocket()
    if (socket) {
      socket.emit('equippedItemsIds', this.equippedItemsIds)
    }
  }

  public updateEquippedItems() {
    this.sendEquippedItemsIds()
  }

  public equipItem(uniqueId: string) {
    const item = this.inventoryItems.equip[uniqueId]
    if (!item) {
      return
    }

    const itemData = getItemData(item.itemId)
    if (!itemData) {
      return
    }

    const slotKey = itemData.slot
    this.equippedItemsIds[slotKey] = uniqueId

    if (slotKey === 'primaryWeapon') {
      this.instantiatePrimaryWeapon(true)
    }
    if (slotKey === 'secondaryWeapon') {
      this.instantiateSecondaryWeapon(true)
    }

    this.updateEquippedItems()
  }

  public unequipItem(slotKey: ItemSlotKey) {
    this.equippedItemsIds[slotKey] = null

    if (slotKey === 'primaryWeapon') {
      this.instantiatePrimaryWeapon(true)
    }
    if (slotKey === 'secondaryWeapon') {
      this.instantiateSecondaryWeapon(true)
    }

    this.updateEquippedItems()
  }

  public addEquipItem(item: IEquipItem) {
    const uniqueId = uuidv4()
    this.inventoryItems.equip[uniqueId] = item
    this.sendInventoryItems()
  }

  public upgradeItem(upgradeItemId: string, itemIdsToUpgradeWith: string[]) {
    if (itemIdsToUpgradeWith.length > 5) {
      return
    }

    // if any provided id is not valid item in inventory, return
    if (
      !this.inventoryItems.equip[upgradeItemId] ||
      !itemIdsToUpgradeWith.every((id) => this.inventoryItems.equip[id])
    ) {
      return
    }

    const didUpgradeSucceed = Math.random() > 0.5

    itemIdsToUpgradeWith.forEach((id) => {
      delete this.inventoryItems.equip[id]
    })

    if (didUpgradeSucceed) {
      this.inventoryItems.equip[upgradeItemId].upgradeLevel += 1
    }

    this.sendInventoryItems()
    this.player.getSocket()?.emit('upgradeItemResponse', didUpgradeSucceed)
  }

  public instantiateActionBarItems() {
    this.instantiatePrimaryWeapon()
  }

  private instantiatePrimaryWeapon(send?: boolean) {
    if (!this.equippedItemsIds.primaryWeapon) {
      if (this.actionBarItems.primaryWeapon) {
        this.actionBarItems.primaryWeapon = null
        send && this.sendActionBarItems()
      }
      return
    }

    const itemFromInventory = this.inventoryItems.equip[this.equippedItemsIds.primaryWeapon]
    if (!itemFromInventory) {
      return
    }

    const primaryWeaponData = getItemData(itemFromInventory.itemId) as IDetermingRenderItemData
    if (!primaryWeaponData) {
      return
    }

    if (primaryWeaponData.instantiationClass === 'melee-weapon') {
      this.actionBarItems.primaryWeapon = new MeleeWeapon(
        {
          ...(primaryWeaponData as IMeleeWeaponItemData),
          uniqueId: this.equippedItemsIds.primaryWeapon,
          upgradeLevel: itemFromInventory.upgradeLevel,
          damageAmount: (primaryWeaponData as IMeleeWeaponItemData).baseDamageAmount,
        },
        this.player
      )
    }

    send && this.sendActionBarItems()
  }

  private instantiateSecondaryWeapon(send?: boolean) {
    if (!this.equippedItemsIds.secondaryWeapon) {
      if (this.actionBarItems.secondaryWeapon) {
        this.actionBarItems.secondaryWeapon = null
        send && this.sendActionBarItems()
      }
      return
    }

    const itemFromInventory = this.inventoryItems.equip[this.equippedItemsIds.secondaryWeapon]
    if (!itemFromInventory) {
      return
    }

    const secondaryWeaponData = getItemData(itemFromInventory.itemId) as IDetermingRenderItemData
    if (!secondaryWeaponData) {
      return
    }

    if (secondaryWeaponData.instantiationClass === 'shield') {
      this.actionBarItems.secondaryWeapon = new Shield({
        ...secondaryWeaponData,
        uniqueId: this.equippedItemsIds.secondaryWeapon,
        upgradeLevel: itemFromInventory.upgradeLevel,
        player: this.player,
      })
    }

    send && this.sendActionBarItems()
  }

  private instantiateHands = () => {
    return new MeleeWeapon(
      {
        ...hands,
        uniqueId: uuidv4(),
        damageAmount: hands.baseDamageAmount,
        upgradeLevel: 0,
      },
      this.player
    )
  }

  public getCurrentEquippedActionBarItem(): InstanceItem {
    if (!this.currentEquippedActionBarItemId) {
      return this.instantiatedHands
    }

    const item: InstanceItem | null | undefined =
      this.actionBarItems[this.currentEquippedActionBarItemId]

    if (!item) {
      return this.instantiatedHands
    }

    return item
  }

  public setIsUsingItem(bool: boolean) {
    this.isUsingItem = bool
  }

  public handleItemUse() {
    // this.handleAttackEnhancementTimeout()

    if (
      !this.player.isAlive ||
      !this.isUsingItem ||
      this.player.effectManager.effects.currentStunId
    ) {
      return
    }

    const item = this.getCurrentEquippedActionBarItem()

    if (!(item instanceof MeleeWeapon)) {
      return
    }

    item.createTrigger(this.player)
  }

  public handleActionTrigger() {
    if (
      !this.player.isAlive ||
      !this.actionTrigger ||
      Date.now() < this.actionTrigger.triggerTimestamp
    ) {
      return
    }

    const item = this.getCurrentEquippedActionBarItem()
    if (item instanceof MeleeWeapon) {
      item.handleTrigger(this.player)
    }
    this.actionTrigger = null

    // if (this.trigger.ability) {
    //   console.log('action cast')
    //   const item = Object.values(this.equippedItems).find(
    //     (eqItem) => eqItem.itemId === this.trigger?.ability?.itemId
    //   ) as Ability
    //   if (!item) {
    //     console.log('no item')
    //     this.trigger = null
    //     return
    //   }

    //   this.trigger.ability.triggerCallback()
    //   item.putOnCooldown()
    //   this.trigger = null
    // } else {
    //   const item = this.getCurrentEquippedActionBarItem()
    //   if (item instanceof TriggerItem) {
    //     item.handleTrigger(this)
    //     this.trigger = null
    //   }
    // }
  }

  public createActionTrigger(
    actionTrigger: Omit<
      IActionTrigger,
      'createdTimestamp' | 'endsAtTimestamp' | 'triggerTimestamp' | 'renderBar'
    > & {
      triggerRatio: number
      renderBar?: boolean
    }
  ) {
    const createdTimestamp = Date.now()

    this.actionTrigger = {
      ...actionTrigger,
      createdTimestamp,
      triggerTimestamp: createdTimestamp + actionTrigger.duration * actionTrigger.triggerRatio,
      endsAtTimestamp: createdTimestamp + actionTrigger.duration,
      renderBar: actionTrigger.renderBar ?? false,
      triggerCallback: actionTrigger.triggerCallback,
    }
  }
}
