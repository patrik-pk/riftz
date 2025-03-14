import { useRef, useEffect } from 'react'
import Renderer from '@/logic/draw/renderer'
import { clamp01 } from '@/utils/utils'
import store from '@/redux/store'
import { useStoreSelector } from '@/redux/hooks'
import gameStateManager from '@/logic/stateManager'
import './minimap.scss'

const handleCanvasResize = (canvas: HTMLCanvasElement) => {
  const resizeCanvas = () => {
    if (!canvas) {
      return
    }

    canvas.width = 200
    canvas.height = 200
  }

  resizeCanvas()
  //   window.addEventListener('resize', resizeCanvas)
}

const drawMinimap = (canvas: HTMLCanvasElement | null, ctx: CanvasRenderingContext2D) => {
  if (!canvas || !ctx) {
    return
  }

  const { mapSize } = store.getState().update
  const latestUpdate = gameStateManager.getLatestUpdate()

  if (!latestUpdate) {
    return
  }

  const renderer = new Renderer(canvas, ctx) // TODO: instantiate only once

  const meX = clamp01(latestUpdate.camera.x / mapSize) * canvas.width
  const meY = clamp01(latestUpdate.camera.y / mapSize) * canvas.height

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  renderer.renderCircle({ x: meX, y: meY }, 8, '#1a1a1')
  renderer.renderCircle({ x: meX, y: meY }, 6, '#a47a33')
}

const Minimap = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<any>(null)
  const requestRef = useRef<any>(null)

  const isPlayerInPVPZone = useStoreSelector(
    (state) => /*state.update.latestUpdate.me.isInPVPZone*/ false
  )

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d')
    canvasRef.current && handleCanvasResize(canvasRef.current)

    const render = () => {
      drawMinimap(canvasRef.current, ctxRef.current)
      requestRef.current = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(requestRef.current)
    }
  }, [])

  return (
    <>
      <p className={`gui-zone-status ${isPlayerInPVPZone ? 'pvp' : 'pve'}`}>
        {isPlayerInPVPZone ? 'PVP' : 'PVE'}
      </p>
      <div className='gui-minimap'>
        <canvas ref={canvasRef}></canvas>
      </div>
    </>
  )
}

export default Minimap
