import Renderer from '@/logic/draw/renderer'
import React, { useEffect, useRef } from 'react'
import './item-loader.scss'

export type ItemLoadingObj = {
  start: number
  finish: number
}

const formatRemainingTime = (timestamp: number): string => {
  const seconds = timestamp / 1000

  if (seconds < 0.7) {
    return seconds.toFixed(1)
  }

  return Math.ceil(seconds).toString()
}

const ItemLoader: React.FC<{
  loading: ItemLoadingObj
}> = ({ loading }) => {
  const requestRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const drawProgress = () => {
    if (!canvasRef.current || !contextRef.current) {
      return
    }

    contextRef.current.setTransform(1, 0, 0, 1, 0, 0)
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const now = Date.now()

    if (now >= loading.finish) {
      return
    }

    const canvas = canvasRef.current
    const ctx = contextRef.current
    const renderer = new Renderer(canvas, ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const totalDuration = loading.finish - loading.start
    const elapsedDuration = now - loading.start

    const progress = Math.min(1, elapsedDuration / totalDuration)
    const remainingTime = loading.finish - now // Draw text next
    const formattedRemainingTime = formatRemainingTime(remainingTime)

    const loaderHeight = (1 - progress) * canvas.height

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, canvas.height, canvas.width, -loaderHeight)
    renderer.renderText(
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
      },
      formattedRemainingTime,
      {
        textAlign: 'center',
        textBaseLine: 'middle',
      }
    )

    requestRef.current = requestAnimationFrame(drawProgress)
  }

  const handleCanvasResize = () => {
    if (!canvasRef.current || !wrapperRef.current) {
      return
    }

    canvasRef.current.width = wrapperRef.current.clientWidth
    canvasRef.current.height = wrapperRef.current.clientHeight
  }

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) {
      return
    }

    contextRef.current = canvasRef.current.getContext('2d')
    handleCanvasResize()
    const resizeObserver = new ResizeObserver(handleCanvasResize)
    resizeObserver.observe(wrapperRef.current)

    return () => {
      if (typeof requestRef.current === 'number') {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(drawProgress)
  }, [loading])

  return (
    <div className='cooldown' ref={wrapperRef}>
      <canvas className='cooldown-canvas' ref={canvasRef}></canvas>
    </div>
  )
}

export default ItemLoader
