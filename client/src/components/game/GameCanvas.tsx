import { useEffect, useRef } from 'react'

import handleCanvasResize from '../../logic/handleCanvasResize'
import Renderer from '../../logic/draw/renderer'

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const requestRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    ctxRef.current = canvasRef.current.getContext('2d')

    if (!ctxRef.current) return

    handleCanvasResize(ctxRef.current)
    const renderer = new Renderer(canvasRef.current, ctxRef.current)

    const render = () => {
      renderer.render()
      requestRef.current = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      if (requestRef.current !== null) {
        window.cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  return <canvas id='gameCanvas' ref={canvasRef}></canvas>
}

export default GameCanvas
