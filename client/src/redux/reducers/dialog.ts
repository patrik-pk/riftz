import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type DialogId =
  | 'login'
  | 'profile'
  | 'shop'
  | 'file-manager'
  | 'challenges'
  | 'product'
  | 'inventory'
  | 'upgrade'

interface Dialog {
  isOpened: boolean
}

interface InventoryDialog extends Dialog {
  tab: string
}

type Dialogs = Record<DialogId, Dialog> & {
  inventory: InventoryDialog
}

interface DialogState {
  dialogs: Dialogs
}

const initialState: DialogState = {
  dialogs: {
    login: { isOpened: false },
    profile: { isOpened: false },
    shop: { isOpened: false },
    'file-manager': { isOpened: false },
    challenges: { isOpened: false },
    product: { isOpened: false },
    inventory: {
      isOpened: false,
      tab: ''
    },
    upgrade: {
      isOpened: false
    }
  }
}

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<DialogId>) => {
      state.dialogs[action.payload].isOpened = true
    },
    closeDialog: (state, action: PayloadAction<DialogId>) => {
      state.dialogs[action.payload].isOpened = false
    }
  }
})

export const { openDialog, closeDialog } = dialogSlice.actions
export default dialogSlice.reducer
