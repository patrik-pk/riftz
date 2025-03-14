import gameStateManager from '@/logic/stateManager'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { IActionBarItems, IEquipedItemsIds, IInventoryItems, ILevel, IServerInfo, IUpdate } from 'riftz-shared'

export interface UpdateState extends IServerInfo {
  lastUpdateArrivedTimestamp: number | null
  latency: number
  latestUpdate: IUpdate
  equippedItemsIds: IEquipedItemsIds
  actionBarItems: IActionBarItems
  inventoryItems: IInventoryItems
  isAlive: boolean
  level: ILevel
}

const initialState: UpdateState = {
  mapSize: 0,
  lastUpdateArrivedTimestamp: null,
  latency: 0,
  latestUpdate: gameStateManager.getEmptyUpdate(),
  equippedItemsIds: {
    primaryWeapon: null,
    secondaryWeapon: null,
    armor: null,
    accessory: null
  },
  actionBarItems: {
    primaryWeapon: null,
    secondaryWeapon: null,
    '0': null,
    '1': null,
    '2': null,
    '3': null,
    '4': null,
    '5': null
  },
  inventoryItems: {
    equip: {},
    materials: {}
  },
  isAlive: false,
  level: {
    currentLevel: 0,
    currentXp: 0,
    xpToNextLevel: 0,
    totalXp: 0
  }
}

const updateSlice = createSlice({
  name: 'update',
  initialState,
  reducers: {
    setLatency: (state, action: PayloadAction<number>) => {
      state.latency = action.payload
    },
    setServerInfo: (state, action: PayloadAction<IServerInfo>) => {
      const { mapSize } = action.payload

      state.mapSize = mapSize
    },
    setIsAlive(state, action: PayloadAction<boolean>) {
      state.isAlive = action.payload
    },
    setLevel(state, action: PayloadAction<ILevel>) {
      state.level = action.payload
    },
    setEquippedItemsIds(state, action: PayloadAction<IEquipedItemsIds>) {
      state.equippedItemsIds = action.payload
    },
    setActionBarItems(state, action: PayloadAction<IActionBarItems>) {
      state.actionBarItems = action.payload
    },
    setInventoryItems(state, action: PayloadAction<IInventoryItems>) {
      state.inventoryItems = action.payload
    }
  }
})

export const {
  setLatency,
  setServerInfo,
  setIsAlive,
  setLevel,
  setEquippedItemsIds,
  setActionBarItems,
  setInventoryItems
} = updateSlice.actions
export default updateSlice.reducer
