import { useState } from 'react'
import Button from '@/components/general/button/Button'
import NoStoreDialog from '@/components/general/noStoreDialog/NoStoreDialog'
import Select, { Option } from '@/components/general/select/Select'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { changeNodeParent, openChangeParentDialog } from '@/redux/reducers/animator'

const ChangeNodeParent = () => {
  const dispatch = useStoreDispatch()
  const data = useStoreSelector((state) => state.animator.data)
  const [selectedParentId, setSelectedParent] = useState<string>('none')
  const changeParentDialogOpened = useStoreSelector(
    (state) => state.animator.changeParentDialogOpened
  )

  const parentOptions = (() => {
    let result: Option[] = [
      {
        label: 'No parent',
        value: 'none',
      },
    ]

    if (data) {
      result.push(
        ...Object.entries(data.parts).map(([nodeId, node]) => ({
          label: node.name,
          value: nodeId,
        }))
      )
    }

    return result
  })()

  return (
    <NoStoreDialog
      dialogTitle='Change parent'
      isOpened={changeParentDialogOpened}
      onClose={() => dispatch(openChangeParentDialog(false))}
    >
      <Select
        options={parentOptions}
        selectedOption={selectedParentId}
        onOptionSelect={(option) => setSelectedParent(option)}
      />
      <Button
        onClick={() => {
          dispatch(changeNodeParent(selectedParentId === 'none' ? null : selectedParentId))
          dispatch(openChangeParentDialog(false))
        }}
      >
        Confirm
      </Button>
    </NoStoreDialog>
  )
}

export default ChangeNodeParent
