import Button from '@/components/general/button/Button'
import Input from '@/components/general/input/Input'
import NoStoreDialog from '@/components/general/noStoreDialog/NoStoreDialog'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { editId, openEditIdDialog, setEditIdInput } from '@/redux/reducers/animator'
import './edit-id-dialog.scss'

const EditIdDialog = () => {
  const dispatch = useStoreDispatch()
  const editIdInput = useStoreSelector((data) => data.animator.editIdInput)
  const editIdDialogOpened = useStoreSelector(
    (data) => data.animator.editIdDialogOpened
  )

  return (
    <NoStoreDialog
      dialogTitle='Edit ID'
      isOpened={editIdDialogOpened}
      onClose={() => dispatch(openEditIdDialog({ opened: false }))}
    >
      <Input
        label='Node ID'
        variant='secondary'
        value={editIdInput}
        onChange={(e) => dispatch(setEditIdInput(e.target.value))}
      />
      <Button
        className='edit-name-dialog-btn'
        onClick={() => {
          dispatch(editId(editIdInput))
          dispatch(openEditIdDialog({ opened: false, input: '' }))
        }}
      >
      Confirm
      </Button>
    </NoStoreDialog>
  )
}

export default EditIdDialog