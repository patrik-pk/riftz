import { useRef, useEffect, useState, useMemo } from 'react'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { constrainValue } from '@/utils/utils'
import { openAssetDialog, updateNodeProperty } from '@/redux/reducers/animator'
import Button from '@/components/general/button/Button'

const Asset = () => {
  const dispatch = useStoreDispatch()

  const data = useStoreSelector((data) => data.animator.data)
  const selectedNodeId = useStoreSelector((data) => data.animator.selectedNodeId)
  const selectedNode = useMemo(() => data?.parts[selectedNodeId ?? ''], [data, selectedNodeId])

  const assetPivotContainerRef = useRef<HTMLDivElement>(null)
  const [pivotMouseDown, setPivotMouseDown] = useState(false)

  useEffect(() => {
    document.addEventListener('mouseup', () => setPivotMouseDown(false))
  }, [])

  useEffect(() => {
    const movePivotPoint = (e: MouseEvent) => {
      const rect = assetPivotContainerRef.current?.getBoundingClientRect()
      if (!rect || !selectedNodeId) {
        return
      }

      let pivotX = (e.clientX - rect.x) / rect.width // value from 0 to 1
      pivotX = 1 - pivotX // flip to value from 1 to 0
      pivotX = pivotX - 0.5 // transform to value from 0.5 to -0.5
      pivotX = Number(constrainValue(pivotX, -0.5, 0.5).toFixed(2))

      let pivotY = (e.clientY - rect.y) / rect.height
      pivotY = 1 - pivotY
      pivotY = pivotY - 0.5
      pivotY = Number(constrainValue(pivotY, -0.5, 0.5).toFixed(2))

      if (!e.shiftKey) {
        dispatch(
          updateNodeProperty({
            nodeId: selectedNodeId,
            propertyPath: 'assetPivotX',
            propertyValue: pivotX,
          })
        )
      }

      if (!e.altKey) {
        dispatch(
          updateNodeProperty({
            nodeId: selectedNodeId,
            propertyPath: 'assetPivotY',
            propertyValue: pivotY,
          })
        )
      }
    }

    if (pivotMouseDown) {
      window.addEventListener('mousemove', movePivotPoint)
    }

    return () => {
      window.removeEventListener('mousemove', movePivotPoint)
    }
  }, [pivotMouseDown])

  if (!selectedNode) {
    return
  }

  return (
    <>
      <div className='asset-img'>
        <div className='asset-img-container' ref={assetPivotContainerRef}>
          <div
            className='asset-pivot-point'
            style={{
              top: `${50 - selectedNode.assetPivotY * 100}%`,
              left: `${50 - selectedNode.assetPivotX * 100}%`,
            }}
            onMouseDown={() => setPivotMouseDown(true)}
          ></div>
          {selectedNode.assetUrl && <img src={selectedNode.assetUrl} alt='' draggable={false} />}
        </div>
      </div>

      <Button
        className='asset-btn'
        variant='secondary'
        onClick={() => dispatch(openAssetDialog(true))}
      >
        Change Asset
      </Button>
    </>
  )
}

export default Asset
