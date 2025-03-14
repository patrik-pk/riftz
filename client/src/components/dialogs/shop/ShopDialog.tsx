import Dialog from '@/components/general/dialog/Dialog'
import React from 'react'
import './shop-dialog.scss'
import Button from '@/components/general/button/Button'
import { useStoreDispatch } from '@/redux/hooks'
import { closeDialog, openDialog } from '@/redux/reducers/dialog'

const ShopDialog: React.FC = () => {
  const dispatch = useStoreDispatch()

  const openProduct = () => {
    dispatch(openDialog('product'))
    dispatch(closeDialog('shop'))
  }

  return (
    <Dialog id={'shop'} dialogTitle='Shop'>
      <>
        <Button onClick={openProduct}>Open Runes</Button>
      </>
    </Dialog>
  )
}

export default ShopDialog
