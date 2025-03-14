import { IDefinedObject } from '@/components/animator/gameObjectRenderer'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { IItem } from 'riftz-shared'

interface GameDataState {
  inGameItems: Record<string, IItem>
  inGameMobs: Record<string, IItem>
  renderableGameObjects: Record<string, IDefinedObject>
}

const initialState: GameDataState = {
  inGameItems: {},
  inGameMobs: {},
  renderableGameObjects: {}
}

const gameDataSlice = createSlice({
  name: 'gameData',
  initialState,
  reducers: {
    setInGameItems: (state, action: PayloadAction<GameDataState['inGameItems']>) => {
      state.inGameItems = action.payload
    },
    setInGameMobs: (state, action: PayloadAction<GameDataState['inGameMobs']>) => {
      state.inGameMobs = action.payload
    },
    setRenderableGameObjects: (state, action: PayloadAction<GameDataState['renderableGameObjects']>) => {
      state.renderableGameObjects = action.payload
    }
  }
})

export const { setInGameItems, setInGameMobs, setRenderableGameObjects } = gameDataSlice.actions
export default gameDataSlice.reducer
