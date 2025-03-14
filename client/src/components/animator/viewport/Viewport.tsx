import { useState, useEffect, useRef } from 'react'
import handleCanvasResize from '../../../logic/handleCanvasResize'
import './viewport.scss'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { GameObjectRenderer, IDefinedObject } from '@/components/animator/gameObjectRenderer'
import Checkbox from '@/components/general/checkbox/checkbox'
import {
  defaultObjectSize,
  setDebugHitbox,
  setDebugPivotPoint,
  setObjectRotation,
  setObjectSize,
  setShowGrid,
} from '@/redux/reducers/animator'
import Input from '@/components/general/input/Input'
import store from '@/redux/store'
import VisibilityOff from '@/components/icons/visibility-off.svg'
import { drawSvg } from '@/logic/draw/renderUtils'

const renderGrid = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  const gridSpace = 50
  const gridAmountX = canvas.height / gridSpace
  const gridAmountY = canvas.height / gridSpace

  ctx.save()
  ctx.fillStyle = '#ccc'

  // X Axis
  ctx.save()
  ctx.translate(canvas.width / 2, 0)
  for (let i = 0; i < Math.ceil(gridAmountX / 2); i++) {
    ctx.fillRect(i * gridSpace, 0, 1, canvas.height)
    if (i !== 0) {
      ctx.fillRect(-i * gridSpace, 0, 1, canvas.height)
    }
  }

  ctx.restore()

  // Y Axis
  ctx.save()
  ctx.translate(0, canvas.height / 2)
  for (let i = 0; i < Math.ceil(gridAmountY / 2); i++) {
    ctx.fillRect(0, i * gridSpace, canvas.width, 1)
    if (i !== 0) {
      ctx.fillRect(0, -i * gridSpace, canvas.width, 1)
    }
  }
  ctx.restore()

  ctx.restore()
}

export const Viewport = () => {
  const dispatch = useStoreDispatch()

  const [menuVisible, setMenuVisible] = useState(false)

  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>()
  const requestRef = useRef<number | null>(null)

  const data = useStoreSelector((state) => state.animator.data)
  const dataRef = useRef<IDefinedObject | null>(null)
  const debugHitbox = useStoreSelector((state) => state.animator.debugHitbox)
  const debugPivotPoint = useStoreSelector((state) => state.animator.debugPivotPoint)
  const showGrid = useStoreSelector((state) => state.animator.showGrid)
  const objectRotation = useStoreSelector((state) => state.animator.objectRotation)
  const objectSize = useStoreSelector((state) => state.animator.objectSize)

  useEffect(() => {
    const handleMenuToggle = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n') {
        setMenuVisible(!menuVisible)
      }
    }

    document.addEventListener('keydown', handleMenuToggle)
    return () => {
      document.removeEventListener('keydown', handleMenuToggle)
    }
  }, [menuVisible])

  // TODO: better solution
  const objectSizeRef = useRef(0)
  useEffect(() => {
    objectSizeRef.current = objectSize
  }, [objectSize])
  const objectRotationRef = useRef(0)
  useEffect(() => {
    objectRotationRef.current = objectRotation
  }, [objectRotation])
  const showGridRef = useRef(false)
  useEffect(() => {
    showGridRef.current = showGrid
  }, [showGrid])

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    if (!canvasRef.current) return

    ctxRef.current = canvasRef.current.getContext('2d')

    if (!ctxRef.current) return

    handleCanvasResize(ctxRef.current)
    // const renderer = new Renderer(canvasRef.current, ctxRef.current)
    const gameObjectRenderer = new GameObjectRenderer(canvasRef.current, ctxRef.current)

    const renderLoop = () => {
      if (!ctxRef.current || !canvasRef.current || !dataRef.current) {
        return
      }

      ctxRef.current.setTransform(1, 0, 0, 1, 0, 0)
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      if (showGridRef.current) {
        renderGrid(canvasRef.current, ctxRef.current)
      }

      ctxRef.current.translate(canvasRef.current.width / 2, canvasRef.current.height / 2)

      const animation = store.getState().animator.currentAnimation
      gameObjectRenderer.renderGameObject({
        data: dataRef.current,
        size: objectSizeRef.current,
        rotation: objectRotationRef.current,
        animation,
        type: 'animator',
      })

      // const svgPath = 'M 0 -2 L 1 -1 Q 2 0 1 2 L -1 3 Q -1 3 -1 3 Q -2 3 -3 2 Q -4 1 -3 0 Q -2 0 -2 -1 Q -1 0 -1 0'
      // drawSvg({
      //   ctx: ctxRef.current,
      //   svgPath,
      //   scale: { x: 20, y: 20 },
      //   defaultStroke: true
      // })
    }

    const render = () => {
      if (!canvasRef.current || !ctxRef.current) {
        return
      }
      // renderer.renderAnimator()
      // renderXXX(dataRef.current, canvasRef.current, ctxRef.current)
      renderLoop()
      requestRef.current = window.requestAnimationFrame(render)
    }

    // setTimeout(() => {
    render()
    // }, 500)

    return () => {
      if (requestRef.current !== null) {
        window.cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  return (
    <div className='viewport' ref={canvasContainerRef}>
      <canvas id='animatorCanvas' ref={canvasRef}></canvas>

      {menuVisible && (
        <div className='viewport-options'>
          <div className='hide-btn' onClick={() => setMenuVisible(false)}>
            <VisibilityOff />
          </div>

          <Checkbox
            label={'Debug Hitbox'}
            isChecked={debugHitbox}
            onChange={() => dispatch(setDebugHitbox(!debugHitbox))}
          />
          <Checkbox
            label={'Debug Pivot Point'}
            isChecked={debugPivotPoint}
            onChange={() => dispatch(setDebugPivotPoint(!debugPivotPoint))}
          />
          <Checkbox
            label={'Show grid'}
            isChecked={showGrid}
            onChange={() => dispatch(setShowGrid(!showGrid))}
          />
          <Input
            variant='secondary'
            label='Object Rotation'
            value={objectRotation}
            type='number'
            step={Number((Math.PI / 8).toFixed(3))}
            onChange={(e) => dispatch(setObjectRotation(Number(e.target.value)))}
            showClear={objectRotation !== 0}
            onClear={() => dispatch(setObjectRotation(0))}
          />
          <Input
            variant='secondary'
            label='Object Size'
            value={objectSize}
            type='number'
            step={10}
            onChange={(e) => dispatch(setObjectSize(Number(e.target.value)))}
            showClear={objectSize !== defaultObjectSize}
            onClear={() => dispatch(setObjectSize(defaultObjectSize))}
          />
        </div>
      )}
    </div>
  )
}
