import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface User {
  discordAuth?: {
    id: string
    username: string
    globalName: string
    avatar: string
  }
  googleAuth?: {
    id: string
    name: string
    picture: string
  }
}

interface AuthState {
  user: User | null
}

const initialState: AuthState = {
  user: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    }
  }
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
