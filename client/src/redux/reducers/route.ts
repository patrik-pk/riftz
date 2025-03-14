import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type Route = 'GAME' | 'ANIMATOR' | 'MAP-EDITOR'

interface RouteState {
  currentRoute: Route
}

const initialState: RouteState = {
  currentRoute: 'GAME'
}

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setRoute: (state, action: PayloadAction<Route>) => {
      state.currentRoute = action.payload
    }
  }
})

export const { setRoute } = routeSlice.actions
export default routeSlice.reducer
