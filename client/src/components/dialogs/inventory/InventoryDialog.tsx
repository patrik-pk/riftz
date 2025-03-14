import Dialog from '@/components/general/dialog/Dialog'
import './inventory-dialog.scss'
import Item, { IEquipItemTyped } from '@/components/game/gameUI/item/Item'
import { useStoreSelector } from '@/redux/hooks'
import { useMemo } from 'react'
import { socket } from '@/logic/socket'
import { ItemSlotKey } from 'riftz-shared'

const InventoryDialog = () => {
  const inventoryItems = useStoreSelector((state) => state.update.inventoryItems)
  const equippedItemsIds = useStoreSelector((state) => state.update.equippedItemsIds)

  const equippedItemsIdsArray = useMemo(() => {
    return Object.values(equippedItemsIds)
  }, [equippedItemsIds])

  const primary = ((): IEquipItemTyped | undefined => {
    if (!equippedItemsIds.primaryWeapon || !inventoryItems.equip[equippedItemsIds.primaryWeapon]) {
      return
    }

    return {
      ...inventoryItems.equip[equippedItemsIds.primaryWeapon],
      uniqueId: equippedItemsIds.primaryWeapon,
      type: 'equip',
    }
  })()

  const secondary = ((): IEquipItemTyped | undefined => {
    if (
      !equippedItemsIds.secondaryWeapon ||
      !inventoryItems.equip[equippedItemsIds.secondaryWeapon]
    ) {
      return
    }

    return {
      ...inventoryItems.equip[equippedItemsIds.secondaryWeapon],
      uniqueId: equippedItemsIds.secondaryWeapon,
      type: 'equip',
    }
  })()

  const armor = ((): IEquipItemTyped | undefined => {
    if (!equippedItemsIds.armor || !inventoryItems.equip[equippedItemsIds.armor]) {
      return
    }

    return {
      ...inventoryItems.equip[equippedItemsIds.armor],
      uniqueId: equippedItemsIds.armor,
      type: 'equip',
    }
  })()

  const accessory = ((): IEquipItemTyped | undefined => {
    if (!equippedItemsIds.accessory || !inventoryItems.equip[equippedItemsIds.accessory]) {
      return
    }

    return {
      ...inventoryItems.equip[equippedItemsIds.accessory],
      uniqueId: equippedItemsIds.accessory,
      type: 'equip',
    }
  })()

  const wings = ((): IEquipItemTyped | undefined => {
    if (!equippedItemsIds.wings || !inventoryItems.equip[equippedItemsIds.wings]) {
      return
    }

    return {
      ...inventoryItems.equip[equippedItemsIds.wings],
      uniqueId: equippedItemsIds.wings,
      type: 'equip',
    }
  })()

  const unequipItem = (slotKey: ItemSlotKey) => {
    socket.emit('unequipItem', slotKey)
  }

  const equipItem = (uniqueId: string) => {
    socket.emit('equipItem', uniqueId)
  }

  return (
    <Dialog className='inventory-dialog' id={'inventory'} dialogTitle='Inventory' persistent>
      <div className='inventory'>
        <div className='inventory-equip'>
          <div className='equip-left'>
            <Item item={accessory} onDoubleClick={() => unequipItem('accessory')} />
            <Item item={armor} onDoubleClick={() => unequipItem('armor')} />
            <Item item={wings} onDoubleClick={() => unequipItem('wings')} />
          </div>

          <div className='equip-bottom'>
            <Item item={primary} onDoubleClick={() => unequipItem('primaryWeapon')} />
            <Item item={secondary} onDoubleClick={() => unequipItem('secondaryWeapon')} />
          </div>

          <div className='equip-right'>
            <Item />
            <Item />
            <Item />
          </div>
        </div>

        <div className='inventory-other'>
          <div className='inventory-item-list'>
            {Object.entries(inventoryItems.equip)
              .filter((entry) => !equippedItemsIdsArray.includes(entry[0]))
              .map((entry, i) => {
                const [uniqueId, item] = entry
                return (
                  <Item
                    key={i}
                    item={{ ...item, uniqueId, type: 'equip' }}
                    onDoubleClick={() => equipItem(uniqueId)}
                  />
                )
              })}
            {Object.entries(inventoryItems.materials).map((entry, i) => {
              const [itemId, materialItem] = entry
              return <Item key={i} item={{ ...materialItem, itemId, type: 'material' }} />
            })}
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default InventoryDialog
