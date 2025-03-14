import { useState, useEffect } from 'react'
import './hierarchy.scss'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { HiearchyNode } from './node/HiearchyNode'
import {
  GameObjectRenderer,
  IDefinedTreeObject,
} from '@/components/animator/gameObjectRenderer'
import Button from '@/components/general/button/Button'
import { setAddNodeDialogOpened, setAddNodeParentId } from '@/redux/reducers/animator'

export const Hierarchy = () => {
  const dispatch = useStoreDispatch()
  const data = useStoreSelector((state) => state.animator.data)
  const addNodeDialogOpened = useStoreSelector((state) => state.animator.addNodeDialogOpened)
  const [tree, setTree] = useState<IDefinedTreeObject | null>(null)

  useEffect(() => {
    setTree(data ? GameObjectRenderer.constructTreeFromObject(data) : null)
  }, [data])

  return (
    <section className='hiearchy'>
      <div className='hiearchy-nodes'>
        {tree &&
          tree.parts.map((node) => {
            return <HiearchyNode data={node} key={node.id} />
          })}
      </div>

      <Button
        className='add-node-btn'
        variant='secondary'
        onClick={() => {
          dispatch(setAddNodeDialogOpened(!addNodeDialogOpened))
          dispatch(setAddNodeParentId(null))
        }}
      >
        Add node
      </Button>
    </section>
  )
}
