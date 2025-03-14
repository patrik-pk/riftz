import { useMemo } from 'react'
import './inspector.scss'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import {
  copyNode,
  deleteSelectedNode,
  openChangeParentDialog,
  openEditIdDialog,
  setAddNodeDialogOpened,
  setAddNodeParentId,
} from '@/redux/reducers/animator'
import Button from '@/components/general/button/Button'
import EditIcon from '@/components/icons/edit.svg'
import DeleteIcon from '@/components/icons/delete.svg'
import PartProperties from '@/components/animator/inspector/PartProperties'
import Asset from './Asset'

export const Inspector = () => {
  const dispatch = useStoreDispatch()
  const data = useStoreSelector((data) => data.animator.data)
  const changeParentDialogOpened = useStoreSelector(
    (data) => data.animator.changeParentDialogOpened
  )
  const addNodeDialogOpened = useStoreSelector((data) => data.animator.addNodeDialogOpened)
  const selectedNodeId = useStoreSelector((data) => data.animator.selectedNodeId)

  const selectedNode = useMemo(() => data?.parts[selectedNodeId ?? ''], [data, selectedNodeId])

  return (
    <section className='inspector'>
      {!selectedNodeId && !selectedNode ? (
        <p>no node selected</p>
      ) : (
        <>
          <div className='detail-first'>
            <div className='name'>
              {selectedNodeId}
              <span
                className='edit-name-btn'
                onClick={() =>
                  dispatch(
                    openEditIdDialog({
                      opened: true,
                      type: 'inspector',
                      input: selectedNodeId as string,
                    })
                  )
                }
              >
                <EditIcon />
              </span>
            </div>

            <Asset />

            <PartProperties />
          </div>

          <div className='bottom-actions'>
            <Button
              variant='secondary'
              onClick={() => {
                dispatch(setAddNodeDialogOpened(!addNodeDialogOpened))
                dispatch(setAddNodeParentId(selectedNodeId))
              }}
            >
              Add child node
            </Button>
            <Button
              variant='secondary'
              onClick={() => dispatch(openChangeParentDialog(!changeParentDialogOpened))}
            >
              Change Parent
            </Button>
            <Button
              variant='secondary'
              onClick={() => {
                dispatch(copyNode())
              }}
            >
              Copy
            </Button>
            <Button
              variant='secondary'
              icon={<DeleteIcon />}
              onClick={() => {
                if (confirm('Are you sure you want to delete this node?')) {
                  dispatch(deleteSelectedNode())
                }
              }}
            ></Button>
          </div>
        </>
      )}
    </section>
  )
}
