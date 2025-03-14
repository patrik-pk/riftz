import { useState, useEffect } from 'react'
import Button from '@/components/general/button/Button'
import Input from '@/components/general/input/Input'
import NoStoreDialog from '@/components/general/noStoreDialog/NoStoreDialog'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { addNewNode, setAddNodeDialogOpened } from '@/redux/reducers/animator'
import './add-node-dialog.scss'

const AddNodeDialog = () => {
  const dispatch = useStoreDispatch()
  const addNodeDialogOpened = useStoreSelector((state) => state.animator.addNodeDialogOpened)
  const [newNodeId, setNewNodeId] = useState('')

  useEffect(() => {
    setNewNodeId('')
  }, [addNodeDialogOpened])

  return (
    <NoStoreDialog
      dialogTitle='Add Node'
      isOpened={addNodeDialogOpened}
      onClose={() => dispatch(setAddNodeDialogOpened(false))}
    >
      <Input
        label='Node ID'
        variant='secondary'
        value={newNodeId}
        onChange={(e) => setNewNodeId(e.target.value)}
      />
      <Button
        className='add-node-dialog-btn'
        onClick={() => {
          dispatch(
            addNewNode({
              id: newNodeId,
            })
          )
          dispatch(setAddNodeDialogOpened(false))
        }}
      >
    Add
      </Button>
    </NoStoreDialog>
  )
}

export default AddNodeDialog