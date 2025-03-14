import React, { useState, useMemo, useEffect } from 'react'
import './upgrade-dialog.scss'
import Dialog from '@/components/general/dialog/Dialog'
import Item, { IEquipItemTyped } from '@/components/game/gameUI/item/Item'
import { useStoreSelector } from '@/redux/hooks'
import Button from '@/components/general/button/Button'
import { socket } from '@/logic/socket'
import { eventHandler } from '@/utils/eventHandler'

const UpgradeDialog = () => {
  const inventoryItems = useStoreSelector((state) => state.update.inventoryItems)
  const equippedItemsIds = useStoreSelector((state) => state.update.equippedItemsIds)
  const isOpened = useStoreSelector((state) => state.dialog.dialogs.upgrade)

  const equippedItemsIdsArray = useMemo(() => {
    return Object.values(equippedItemsIds)
  }, [equippedItemsIds])

  // index 0 = item to upgrade, index 1 - 6 = items to upgrade with
  const getEmptySelectedItemIdsToUpgrade = (): (string | null)[] => [
    null,
    null,
    null,
    null,
    null,
    null,
  ]
  const [selectedItemIdsToUpgrade, setSelectedItemIdsToUpgrade] = useState<(string | null)[]>(
    getEmptySelectedItemIdsToUpgrade()
  )
  const [upgradeStatus, setUpgradeStatus] = useState<'success' | 'fail' | 'none'>('none')

  const selectedItemsToUpgrade = useMemo<(IEquipItemTyped | null)[]>(() => {
    return selectedItemIdsToUpgrade.map((id) => {
      if (id === null || !inventoryItems.equip[id]) {
        return null
      }
      return {
        uniqueId: id,
        type: 'equip',
        itemId: inventoryItems.equip[id].itemId,
        upgradeLevel: inventoryItems.equip[id].upgradeLevel,
      } as IEquipItemTyped
    })
  }, [selectedItemIdsToUpgrade, inventoryItems])

  const addItemToUpgrades = (uniqueId: string) => {
    if (selectedItemIdsToUpgrade.includes(uniqueId)) {
      return
    }

    const emptyIndex = selectedItemIdsToUpgrade.findIndex((id) => id === null)
    if (emptyIndex < 0) {
      return
    }

    if (upgradeStatus !== 'none') {
      setUpgradeStatus('none')
    }

    const newIds = [...selectedItemIdsToUpgrade]
    newIds[emptyIndex] = uniqueId
    setSelectedItemIdsToUpgrade(newIds)
  }

  const removeItemFromUpgrades = (index: number) => {
    if (upgradeStatus !== 'none') {
      setUpgradeStatus('none')
    }

    const newIds = [...selectedItemIdsToUpgrade]
    newIds[index] = null
    setSelectedItemIdsToUpgrade(newIds)
  }

  const upgradeItem = () => {
    const [itemIdToUpgrade, ...itemIdsToUpgradeWith] = selectedItemIdsToUpgrade
    if (itemIdToUpgrade === null) {
      return
    }

    const itemIdsToUpgradeWithFiltered = itemIdsToUpgradeWith.filter((id) => id !== null)
    if (!itemIdsToUpgradeWithFiltered.length) {
      return
    }

    socket.emit('upgradeItem', itemIdToUpgrade, itemIdsToUpgradeWithFiltered)
  }

  useEffect(() => {
    // note: this works without defining the .on after socket is connected
    // cause this handle refreshes each time "selectedItemIdsToUpgrade" change
    socket.on('upgradeItemResponse', (didUpgradeSucceed) => {
      console.log('upgrade result', didUpgradeSucceed)
      const itemToUpgradeId = selectedItemIdsToUpgrade[0]
      const newSelectedItemIdsToUpgrade = getEmptySelectedItemIdsToUpgrade()
      newSelectedItemIdsToUpgrade[0] = itemToUpgradeId
      setSelectedItemIdsToUpgrade(newSelectedItemIdsToUpgrade)
      setUpgradeStatus(didUpgradeSucceed ? 'success' : 'fail')

      // TODO: basic item animation
    })

    return () => {
      socket.off('upgradeItemResponse')
    }
  }, [selectedItemIdsToUpgrade])

  useEffect(() => {
    setSelectedItemIdsToUpgrade(getEmptySelectedItemIdsToUpgrade())
    setUpgradeStatus('none')
  }, [isOpened])

  useEffect(() => {
    console.log(upgradeStatus, '???')
  }, [upgradeStatus])

  return (
    <Dialog className='upgrade-dialog' id={'upgrade'} dialogTitle='Upgrade' persistent>
      <div className='upgrade-content'>
        <div className='upgrade-left'>
          {upgradeStatus !== 'none' && (
            <div className='upgrade-status'>{upgradeStatus === 'success' ? 'SUCCESS' : 'FAIL'}</div>
          )}

          <div className='upgrade-left-main'>
            {/* item to upgrade */}
            {selectedItemsToUpgrade.map((item, i) => {
              return (
                <Item
                  className='upgrade-item main'
                  key={i}
                  item={item}
                  onMouseDown={(e) => e.button === 2 && removeItemFromUpgrades(i)}
                />
              )
            })}
          </div>
          <div className='upgrade-chance'>10%</div>
          <Button className='upgrade-btn' onClick={upgradeItem}>
            Upgrade
          </Button>
        </div>

        <div className='upgrade-item-list'>
          <div className='upgrade-item-list-content'>
            {Object.entries(inventoryItems.equip)
              .filter((entry) => !equippedItemsIdsArray.includes(entry[0]))
              .map((entry, i) => {
                const [uniqueId, item] = entry
                return (
                  <Item
                    key={i}
                    item={{ ...item, uniqueId, type: 'equip' }}
                    onClick={() => addItemToUpgrades(uniqueId)}
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

export default UpgradeDialog
