import React, { useState, useEffect, useMemo } from 'react'
import './child.scss'
import Expand from '@/components/icons/expand.svg'
import Button from '@/components/general/button/Button'
import Input from '@/components/general/input/Input'
import config from '@/config'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { selectNode } from '@/redux/reducers/animator'
import api from '@/api/api'
import axios from 'axios'

const Child: React.FC<{
  data: IGameObjectData
}> = ({ data }) => {
  const { id, displayedName, asset, values } = data

  const dispatch = useStoreDispatch()
  const selectedNodeId = useStoreSelector((state) => state.animator.selectedNodeId)
  const isSelected = useMemo(() => selectedNodeId === id, [selectedNodeId])

  const [expanded, setExpanded] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File>()
  const [sizeMultiplier, setSizeMultiplier] = useState<number>(asset?.sizeMultiplier ?? 0)
  const [pivotAdjustX, setPivotAdjustX] = useState<number>(asset?.pivotAdjustMultiplier?.x ?? 0)
  const [pivotAdjustY, setPivotAdjustY] = useState<number>(asset?.pivotAdjustMultiplier?.y ?? 0)

  const [positionX, setPositionX] = useState<number>(values?.positionMultiplier?.x ?? 0)
  const [positionY, setPositionY] = useState<number>(values?.positionMultiplier?.y ?? 0)
  const [scaleX, setScaleX] = useState<number>(values?.scale?.x ?? 0)
  const [scaleY, setScaleY] = useState<number>(values?.scale?.y ?? 0)
  const [rotation, setRotation] = useState<number>(values?.rotation ?? 0)

  const expand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    console.log(file, 'file???')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const test = await axios.post(`${config.API_URL}/api/files/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log('response?', test)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className={`child ${expanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}>
      <Button
        className='child__header'
        variant='secondary'
        activeEffect={false}
        onClick={() => dispatch(selectNode(isSelected ? null : data.id))}
      >
        <p className='child__header-name'>{displayedName}</p>
        <span className='child__header-expand' onClick={expand}>
          <Expand />
        </span>
      </Button>
      {/* <header className='child__header'>
        <p className='child__header-name'>{displayedName}</p>
        <span className='child__header-expand'>
          <Expand />
        </span>
      </header> */}
      {expanded && (
        <div className='child__content'>
          <section className='content-asset content-section'>
            <p className='section-title'>Asset</p>
            <div className='asset-img'>
              {selectedFile && <img src={URL.createObjectURL(selectedFile)} alt={displayedName} />}
              {!selectedFile && asset?.path && (
                <img src={`${config.API_URL}/assets/${asset.path}.png`} alt={displayedName} />
              )}
              <Input
                className='content-input'
                type='file'
                onChange={handleFileSelect}
                variant='secondary'
                accept='image/png'
              />
            </div>

            <div className='asset-inputs'>
              <Input
                className='content-input'
                type='number'
                label='Pivot (x)'
                value={pivotAdjustX}
                onChange={(e) => setPivotAdjustX(Number(e.target.value) || 0)}
                step={0.1}
                variant='secondary'
              />
              <Input
                className='content-input'
                type='number'
                label='Pivot (y)'
                value={pivotAdjustY}
                onChange={(e) => setPivotAdjustY(Number(e.target.value) || 0)}
                step={0.1}
                variant='secondary'
              />
              <Input
                className='content-input'
                type='number'
                label='Size'
                value={sizeMultiplier}
                onChange={(e) => setSizeMultiplier(Number(e.target.value) || 0)}
                step={0.1}
                variant='secondary'
              />
            </div>
          </section>

          <section className='content-values content-section'>
            <p className='section-title'>Values</p>

            <div className='values-inputs'>
              <Input
                className='content-input'
                type='number'
                label='Position (x)'
                value={positionX}
                onChange={(e) => setPositionX(Number(e.target.value) || 0)}
                step={0.1}
                variant='secondary'
              />
              <Input
                className='content-input'
                type='number'
                label='Position (y)'
                value={positionY}
                onChange={(e) => setPositionY(Number(e.target.value) || 0)}
                step={0.1}
                variant='secondary'
              />
              <Input
                className='content-input'
                type='number'
                label='Rotation'
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value) || 0)}
                step={0.1}
                variant='secondary'
              />
              <Input
                className='content-input'
                type='number'
                label='Scale (x)'
                value={scaleX}
                onChange={(e) => setScaleX(Number(e.target.value) || 0)}
                step={0.1}
                variant='secondary'
              />
              <Input
                className='content-input'
                type='number'
                label='Scale (y)'
                value={scaleY}
                onChange={(e) => setScaleY(Number(e.target.value) || 0)}
                step={0.1}
                variant='secondary'
              />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Child
