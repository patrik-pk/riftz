import { useState, useEffect } from 'react'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import Button from '@/components/general/button/Button'
import { AnimatableKey, animatableKeys } from '@/components/animator/gameObjectRenderer'
import {
  addKeyframes,
  deleteKeyframes,
  deleteSelectedAnimation,
  openEditIdDialog,
  setSelectedAnimationId,
  sortKeyframes,
  updateKeyframes,
} from '@/redux/reducers/animator'
import Expand from '@/components/icons/expand.svg'
import DeleteIcon from '@/components/icons/delete.svg'
import Input from '@/components/general/input/Input'
import EditIcon from '@/components/icons/edit.svg'
import './animation-detail.scss'

export const AnimationDetail = () => {
  const dispatch = useStoreDispatch()
  const data = useStoreSelector((state) => state.animator.data)
  const selectedAnimationId = useStoreSelector((state) => state.animator.selectedAnimationId)

  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)

  const [expandedKeyframeKeys, setExpandedKeyframeKeys] = useState<AnimatableKey[]>([])

  const expandKeyframe = (key: AnimatableKey) => {
    if (expandedKeyframeKeys.includes(key)) {
      const filtered = expandedKeyframeKeys.filter((k) => k !== key)
      setExpandedKeyframeKeys(filtered)
    } else {
      setExpandedKeyframeKeys([...expandedKeyframeKeys, key])
    }
  }

  useEffect(() => {
    setSelectedPartId(null)
  }, [selectedAnimationId])

  if (!data || !selectedAnimationId) return <></>

  return (
    <div className='animation-detail'>
      <div className='animation-detail-top'>
        <Button
          className='adp-back-btn'
          variant='secondary'
          icon={<Expand />}
          onClick={() => dispatch(setSelectedAnimationId(null))}
        />
        <div className='adp-title name'>
          {selectedAnimationId}
          <span
            className='edit-name-btn'
            onClick={() =>
              dispatch(
                openEditIdDialog({
                  opened: true,
                  input: selectedAnimationId,
                  type: 'animator',
                })
              )
            }
          >
            <EditIcon />
          </span>
        </div>
      </div>

      <div className='animation-detail-part-list'>
        {Object.entries(data.parts).map(([partId, part]) => {
          return (
            <Button
              key={partId}
              variant={selectedPartId === partId ? 'primary' : 'secondary'}
              onClick={() => setSelectedPartId(partId)}
            >
              {partId}
            </Button>
          )
        })}
      </div>

      <div className='animation-detail-part-detail'>
        {selectedPartId && data.parts[selectedPartId] ? (
          <>
            <div className='keyframe-properties'>
              {animatableKeys.map((animatableKey) => {
                const keyframes =
                  data.animations[selectedAnimationId].parts[selectedPartId]?.properties[
                    animatableKey
                  ]

                const keyframeAmount =
                  data.animations[selectedAnimationId].parts[selectedPartId]?.properties[
                    animatableKey
                  ]?.keyframes.length ?? 0

                return (
                  <div className='keyframe-property' key={animatableKey}>
                    <Button
                      className='keyframe-expand node-expand'
                      variant={'secondary'}
                      activeEffect={false}
                    >
                      <p className='node-expand-name'>{`${animatableKey} (${keyframeAmount})`}</p>

                      <span
                        className='node-expand-icon'
                        onClick={() => expandKeyframe(animatableKey)}
                      >
                        <Expand />
                      </span>
                    </Button>

                    {expandedKeyframeKeys.includes(animatableKey) && (
                      <div className='keyframe-detail'>
                        {keyframes?.keyframes.length && (
                          <div className='keyframe-rows'>
                            {keyframes.keyframes.map((keyframe, i) => {
                              const value = keyframes?.values[i]

                              return (
                                <div className='keyframe-row' key={i}>
                                  <Input
                                    type='number'
                                    step={0.05}
                                    min={0}
                                    label='Keyframe'
                                    variant='secondary'
                                    value={keyframe}
                                    onChange={(e) =>
                                      dispatch(
                                        updateKeyframes({
                                          animationId: selectedAnimationId,
                                          partId: selectedPartId,
                                          propertyKey: animatableKey,
                                          type: 'keyframes',
                                          value: Number(e.target.value),
                                          valueIndex: i,
                                        })
                                      )
                                    }
                                  />

                                  <Input
                                    type='number'
                                    step={0.05}
                                    label='Value'
                                    variant='secondary'
                                    value={value}
                                    onChange={(e) =>
                                      dispatch(
                                        updateKeyframes({
                                          animationId: selectedAnimationId,
                                          partId: selectedPartId,
                                          propertyKey: animatableKey,
                                          type: 'values',
                                          value: Number(e.target.value),
                                          valueIndex: i,
                                        })
                                      )
                                    }
                                  />

                                  <Button
                                    variant='secondary'
                                    icon={<DeleteIcon />}
                                    className='delete-keyframes-btn'
                                    onClick={() =>
                                      dispatch(
                                        deleteKeyframes({
                                          animationId: selectedAnimationId,
                                          partId: selectedPartId,
                                          propertyKey: animatableKey,
                                          valueIndex: i,
                                        })
                                      )
                                    }
                                  ></Button>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        <div className='keyframes-actions'>
                          <Button
                            variant='secondary'
                            onClick={() =>
                              dispatch(
                                sortKeyframes({
                                  animationId: selectedAnimationId,
                                  partId: selectedPartId,
                                  propertyKey: animatableKey,
                                })
                              )
                            }
                          >
                            Sort
                          </Button>
                          <Button
                            variant='primary'
                            onClick={() =>
                              dispatch(
                                addKeyframes({
                                  animationId: selectedAnimationId,
                                  partId: selectedPartId,
                                  propertyKey: animatableKey,
                                })
                              )
                            }
                          >
                            Add keyframes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>no part selected</>
        )}
      </div>

      <div className='animation-detail-actions'>
        <Button
          variant='secondary'
          icon={<DeleteIcon />}
          onClick={() => {
            if (confirm('Are you sure you want to delete this animation?')) {
              dispatch(deleteSelectedAnimation())
            }
          }}
        ></Button>
      </div>
    </div>
  )
}
