import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface BoxItem {
  label: string
  rarity: Rarity
  revealed: boolean
}

interface BoxOpeningState {
  items: BoxItem[]
}

const initialState: BoxOpeningState = {
  items: []
}

const boxOpeningSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<BoxItem[]>) => {
      state.items = action.payload
    },
    revealItem: (state, action: PayloadAction<number>) => {
      state.items[action.payload].revealed = true
    }
  }
})

export const { setItems, revealItem } = boxOpeningSlice.actions
export default boxOpeningSlice.reducer
