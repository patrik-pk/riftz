import Input from '@/components/general/input/Input'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { clearNodeProperty, updateNodeProperty } from '@/redux/reducers/animator'
import { useMemo } from 'react'

const PartProperties = () => {
  const dispatch = useStoreDispatch()
  const data = useStoreSelector((data) => data.animator.data)
  const originalData = useStoreSelector((data) => data.animator.originalData)
  const selectedNodeId = useStoreSelector((data) => data.animator.selectedNodeId)

  const selectedNode = useMemo(() => data?.parts[selectedNodeId ?? ''], [data, selectedNodeId])
  const originalSelectedNode = useMemo(
    () => originalData?.parts[selectedNodeId ?? ''],
    [originalData, selectedNodeId]
  )

  if (!data || !selectedNodeId || !selectedNode) {
    return <></>
  }

  return (
    <div className='part-properties'>
      <div className='input-group'>
        <Input
          label='Translate X'
          type='number'
          step={0.1}
          variant='secondary'
          value={data.parts[selectedNodeId].translateX}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'translateX',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(
              clearNodeProperty({ nodeId: selectedNodeId, property: 'translateX' })
            )
          }
          showClear={originalSelectedNode && selectedNode.translateX !== originalSelectedNode.translateX}
        />
        <Input
          label='Translate Y'
          type='number'
          step={0.1}
          variant='secondary'
          value={data.parts[selectedNodeId].translateY}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'translateY',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(
              clearNodeProperty({ nodeId: selectedNodeId, property: 'translateY' })
            )
          }
          showClear={
            originalSelectedNode &&
        selectedNode.translateY !== originalSelectedNode.translateY
          }
        />
      </div>

      <div className='input-group'>
        <Input
          label='Scale X'
          type='number'
          step={0.1}
          variant='secondary'
          value={data.parts[selectedNodeId].scaleX}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'scaleX',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(clearNodeProperty({ nodeId: selectedNodeId, property: 'scaleX' }))
          }
          showClear={
            originalSelectedNode && selectedNode.scaleX !== originalSelectedNode.scaleX
          }
        />

        <Input
          label='Scale Y'
          type='number'
          step={0.1}
          variant='secondary'
          value={data.parts[selectedNodeId].scaleY}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'scaleY',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(clearNodeProperty({ nodeId: selectedNodeId, property: 'scaleY' }))
          }
          showClear={
            originalSelectedNode && selectedNode.scaleY !== originalSelectedNode.scaleY
          }
        />
      </div>

      <div className='input-group'>
        <Input
          label='Asset Pivot X'
          type='number'
          step={0.05}
          variant='secondary'
          value={data.parts[selectedNodeId].assetPivotX}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'assetPivotX',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(
              clearNodeProperty({ nodeId: selectedNodeId, property: 'assetPivotX' })
            )
          }
          showClear={
            originalSelectedNode &&
        selectedNode.assetPivotX !== originalSelectedNode.assetPivotX
          }
        />
        <Input
          label='Asset Pivot Y'
          type='number'
          step={0.05}
          variant='secondary'
          value={data.parts[selectedNodeId].assetPivotY}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'assetPivotY',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(
              clearNodeProperty({ nodeId: selectedNodeId, property: 'assetPivotY' })
            )
          }
          showClear={
            originalSelectedNode &&
        selectedNode.assetPivotY !== originalSelectedNode.assetPivotY
          }
        />
      </div>

      <div className='input-group'>
        <Input
          label='Asset Rotation'
          type='number'
          step={0.1}
          variant='secondary'
          value={data.parts[selectedNodeId].assetRotation}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'assetRotation',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(
              clearNodeProperty({ nodeId: selectedNodeId, property: 'assetRotation' })
            )
          }
          showClear={
            originalSelectedNode &&
        selectedNode.assetRotation !== originalSelectedNode.assetRotation
          }
        />
        <Input
          label='Asset Size'
          type='number'
          step={0.1}
          variant='secondary'
          value={data.parts[selectedNodeId].assetSize}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'assetSize',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(clearNodeProperty({ nodeId: selectedNodeId, property: 'assetSize' }))
          }
          showClear={
            originalSelectedNode &&
        selectedNode.assetSize !== originalSelectedNode.assetSize
          }
        />
      </div>

      <div className='input-group'>
        <Input
          label='Rotation'
          type='number'
          step={0.1}
          variant='secondary'
          value={data.parts[selectedNodeId].rotation}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'rotation',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(clearNodeProperty({ nodeId: selectedNodeId, property: 'rotation' }))
          }
          showClear={
            originalSelectedNode &&
        selectedNode.rotation !== originalSelectedNode.rotation
          }
        />
        <Input
          label='Z Index'
          type='number'
          step={10}
          variant='secondary'
          value={data.parts[selectedNodeId].zIndex}
          onChange={(e) => {
            dispatch(
              updateNodeProperty({
                nodeId: selectedNodeId,
                propertyPath: 'zIndex',
                propertyValue: Number(e.target.value),
              })
            )
          }}
          onClear={() =>
            dispatch(clearNodeProperty({ nodeId: selectedNodeId, property: 'zIndex' }))
          }
          showClear={
            originalSelectedNode && selectedNode.zIndex !== originalSelectedNode.zIndex
          }
        />
      </div>
    </div>
  )
}

export default PartProperties