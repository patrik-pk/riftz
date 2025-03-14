import React, { useState, useEffect } from 'react'
import './hiearchy-node.scss'
import Button from '@/components/general/button/Button'
import Expand from '@/components/icons/expand.svg'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { selectNode } from '@/redux/reducers/animator'
import { IDefinedObjectTreePart } from '@/components/animator/gameObjectRenderer'

export const HiearchyNode: React.FC<{
  data: IDefinedObjectTreePart
}> = ({ data }) => {
  const dispatch = useStoreDispatch()
  const [expanded, setExpanded] = useState(false)
  const selectedNodeId = useStoreSelector((data) => data.animator.selectedNodeId)
  const originalData = useStoreSelector((data) => data.animator.originalData)

  useEffect(() => {
    setExpanded(true)
  }, [originalData])

  const expand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  const select = () => {
    dispatch(selectNode(data.id))
  }

  return (
    <div className={`node ${expanded ? 'expanded' : ''}`}>
      <Button
        className='node-expand'
        variant={selectedNodeId === data.id ? 'primary' : 'secondary'}
        activeEffect={false}
        onClick={select}
      >
        <p className='node-expand-name'>{data.id}</p>

        {data.children.length > 0 && (
          <span className='node-expand-icon' onClick={expand}>
            <Expand />
          </span>
        )}
      </Button>

      {expanded && data.children.length > 0 && (
        <ul className='node-children'>
          {data.children.map((child) => {
            return <HiearchyNode data={child} key={child.id} />
          })}
        </ul>
      )}
    </div>
  )
}
