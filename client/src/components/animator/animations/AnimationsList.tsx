import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Button from '@/components/general/button/Button'
import Input from '@/components/general/input/Input'
import {
  createAnimation,
  setAnimationDuration,
  setAnimationRepeat,
  setCurrentAnimation,
  setSelectedAnimationId,
} from '@/redux/reducers/animator'
import Play from '@/components/icons/play.svg'
import Stop from '@/components/icons/stop.svg'
import Checkbox from '@/components/general/checkbox/checkbox'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import store from '@/redux/store'
import { AnimationRenderObj } from '@/components/animator/gameObjectRenderer'

export const AnimationsList = () => {
  const dispatch = useStoreDispatch()
  const data = useStoreSelector((state) => state.animator.data)
  const currentAnimation = useStoreSelector((data) => data.animator.currentAnimation)
  const selectedAnimationId = useStoreSelector((state) => state.animator.selectedAnimationId)

  const setCurrentExistingAnimation = (animation: Omit<AnimationRenderObj, 'uniqueId'>) => {
    if (!data) {
      return
    }

    const uniqueId = uuidv4()
    dispatch(
      setCurrentAnimation({
        uniqueId,
        ...animation,
      })
    )

    if (!animation.repeat) {
      setTimeout(() => {
        if (store.getState().animator.currentAnimation?.uniqueId === uniqueId) {
          dispatch(setCurrentAnimation(null))
        }
      }, animation.duration)
    }
  }

  useEffect(() => {
    const startAnimationOnEnterPress = (e: KeyboardEvent) => {
      if (e.key !== ' ') {
        return
      }

      if (currentAnimation) {
        dispatch(setCurrentAnimation(null))
        return
      }

      if (!selectedAnimationId || !data) {
        return
      }

      setCurrentExistingAnimation({
        id: selectedAnimationId,
        createdAt: Date.now(),
        duration: data.animations[selectedAnimationId].duration,
        repeat: data.animations[selectedAnimationId].repeat,
      })
    }

    document.addEventListener('keydown', startAnimationOnEnterPress)
    return () => {
      document.removeEventListener('keydown', startAnimationOnEnterPress)
    }
  }, [selectedAnimationId, data, currentAnimation])

  if (!data) return <></>

  return (
    <>
      <p className='name'>Animations</p>
      <div className='animation-list'>
        {Object.entries(data.animations).map(([animationId, animation]) => {
          return (
            <div className='animation-list-item' key={animationId}>
              <Button
                variant='secondary'
                onClick={() => dispatch(setSelectedAnimationId(animationId))}
              >
                {animationId}
              </Button>
              <Input
                label='Duration'
                variant='secondary'
                type='number'
                step={100}
                value={animation.duration}
                onChange={(e) =>
                  dispatch(setAnimationDuration({ animationId, value: Number(e.target.value) }))
                }
              />
              <Checkbox
                label='Repeat'
                isChecked={animation.repeat}
                onChange={() =>
                  dispatch(setAnimationRepeat({ animationId, value: !animation.repeat }))
                }
              />
              <Button
                variant='secondary'
                icon={currentAnimation?.id === animationId ? <Stop /> : <Play />}
                iconSize='sm'
                onClick={() => {
                  if (currentAnimation?.id === animationId) {
                    dispatch(setCurrentAnimation(null))
                    return
                  }

                  setCurrentExistingAnimation({
                    id: animationId,
                    duration: animation.duration,
                    createdAt: Date.now(),
                    repeat: animation.repeat,
                  })
                }}
              ></Button>
            </div>
          )
        })}
      </div>
      <div className='animations-actions'>
        <Button variant='primary' onClick={() => dispatch(createAnimation())}>
          New animation
        </Button>
      </div>
    </>
  )
}
