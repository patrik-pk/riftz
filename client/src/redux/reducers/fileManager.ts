import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type Route = 'game-assets' | 'user-assets' | 'upload'

interface RouteObj {
  label: string
  route: Route
}

export const routes: RouteObj[] = [
  { label: 'Game Assets', route: 'game-assets' },
  { label: 'My Assets', route: 'user-assets' },
  { label: 'Upload', route: 'upload' }
]

interface FileManagerState {
  currentRoute: Route
}

const initialState: FileManagerState = {
  currentRoute: 'game-assets'
}

const fileManagerSlice = createSlice({
  name: 'fileManager',
  initialState,
  reducers: {
    setCurrentRoute: (state, action: PayloadAction<Route>) => {
      state.currentRoute = action.payload
    }
  }
})

export const { setCurrentRoute } = fileManagerSlice.actions
export default fileManagerSlice.reducer
