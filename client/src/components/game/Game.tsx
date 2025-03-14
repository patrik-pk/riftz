import { useEffect } from 'react'
import { socket } from '../../logic/socket'
import GameUI from '../../components/game/gameUI/GameUI'
import OpeningUI from '../../components/game/openingUI/index/OpeningUI'
import GameCanvas from '../../components/game/GameCanvas'
import { inputManager } from '../../logic/input'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import {
  setActionBarItems,
  setEquippedItemsIds,
  setInventoryItems,
  setIsAlive,
  setLatency,
  setLevel,
  setServerInfo,
} from '@/redux/reducers/update'
import gameStateManager from '@/logic/stateManager'
import { closeDialog, openDialog } from '@/redux/reducers/dialog'
import { eventHandler } from '@/utils/eventHandler'

const Game = () => {
  const dispatch = useStoreDispatch()
  const isAlive = useStoreSelector((state) => state.update.isAlive)
  const isInventoryDialogOpened = useStoreSelector((state) => state.dialog.dialogs.inventory)
  const isUpgradeDialogOpened = useStoreSelector((state) => state.dialog.dialogs.upgrade)

  useEffect(() => {
    eventHandler.on('socket-connection-change', () => {
      socket.on('connect', () => {
        eventHandler.emit('socket-connected')
        console.log('connect socket')

        socket.on('serverInfo', (serverInfo) => {
          dispatch(setServerInfo(serverInfo))
        })

        socket.on('isAlive', (value) => {
          dispatch(setIsAlive(value))
        })

        socket.on('level', (value) => {
          dispatch(setLevel(value))
        })

        socket.on('update', (update) => {
          const updateDelay = Date.now() - update.timestamp
          dispatch(setLatency(updateDelay))
          gameStateManager.processUpdate(update, updateDelay)
        })

        socket.on('equippedItemsIds', (items) => {
          dispatch(setEquippedItemsIds(items))
        })

        socket.on('actionBarItems', (items) => {
          dispatch(setActionBarItems(items))
        })

        socket.on('inventoryItems', (items) => {
          dispatch(setInventoryItems(items))
        })
      })
    })

    return () => {
      eventHandler.off('socket-connection-change')
    }
  })

  useEffect(() => {
    inputManager.handleInputsBasedOnIsAlive(isAlive)
  }, [isAlive])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLocaleLowerCase() === 'c') {
        dispatch(
          isInventoryDialogOpened.isOpened ? closeDialog('inventory') : openDialog('inventory')
        )
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isInventoryDialogOpened])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLocaleLowerCase() === 'v') {
        dispatch(isUpgradeDialogOpened.isOpened ? closeDialog('upgrade') : openDialog('upgrade'))
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isUpgradeDialogOpened])

  useEffect(() => {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <>
      {isAlive ? <GameUI /> : <OpeningUI />}
      <GameCanvas />
    </>
  )
}

export default Game
