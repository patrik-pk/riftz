// src/components/CanvasPlayground.tsx
import React, { useEffect, useRef } from 'react'
import { IPlaygroundVector2, Renderer } from './renderer'
import { normalizeVector } from '@/components/canvas-playground/helpers'
import { NoiseRenderer } from '@/components/canvas-playground/noiseRenderer'

export let playerDirection: IPlaygroundVector2 = { x: 0, y: 0 }
export let canMove: boolean = false



export const CanvasPlayground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        canMove = !canMove
      }
    })

    document.addEventListener('mousemove', (e) => {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight

      const centerX = screenWidth / 2
      const centerY = screenHeight / 2

      const point: IPlaygroundVector2 = {
        x: e.clientX,
        y: e.clientY,
      }

      const dx = point.x - centerX
      const dy = point.y - centerY

      const normalized = normalizeVector(dx, dy)
      playerDirection = normalized
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderer = new Renderer(canvas, ctx)
    const noiseRenderer = new NoiseRenderer(canvas, ctx)

    let animationFrameId: number
    const renderLoop = () => {
      renderer.render()
      animationFrameId = requestAnimationFrame(renderLoop)
    }
    renderLoop()
    
    // noiseRenderer.render()


    // Cleanup on component unmount
    // return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className='w-screen h-screen'>
      <canvas ref={canvasRef} className='w-full h-full'></canvas>
    </div>
  )
}
