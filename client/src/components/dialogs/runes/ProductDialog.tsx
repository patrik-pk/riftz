import Dialog from '@/components/general/dialog/Dialog'
import React from 'react'
import './product-dialog.scss'
import Button from '@/components/general/button/Button'
import { useStoreDispatch } from '@/redux/hooks'
import { openDialog } from '@/redux/reducers/dialog'
import { BoxItem, setItems } from '@/redux/reducers/boxOpening'

const ProductDialog: React.FC = () => {
  const dispatch = useStoreDispatch()

  const staticItems: BoxItem[] = [
    {
      label: 'Attack Rune',
      rarity: 'legendary',
      revealed: false,
    },
    {
      label: 'Defense Rune',
      rarity: 'common',
      revealed: false,
    },
    {
      label: 'Health Rune',
      rarity: 'rare',
      revealed: false,
    },
  ]

  return (
    <Dialog 
      id={'product'} 
      dialogTitle='Runes' 
      onClose={() => dispatch(openDialog('shop'))}
      persistent
    >
      <>
        product
        <Button onClick={() => dispatch(setItems(staticItems))}>Buy Runes</Button>
      </>
    </Dialog>
  )
}

export default ProductDialog
