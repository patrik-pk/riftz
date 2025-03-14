import { useRef } from 'react'
import './map-editor-viewport.scss'
import { useMapPanning } from '@/components/map-editor/hooks/useMapPanning'
import { useMapZoom } from '@/components/map-editor/hooks/useMapZoom'
import { useMapRenderer } from '@/components/map-editor/hooks/useMapRenderer'

export const MapEditorViewport = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)

  useMapRenderer(canvasRef, canvasContainerRef)
  useMapPanning(canvasRef)
  useMapZoom(canvasRef)

  return (
    <div className='map-editor-viewport me-tile middle' ref={canvasContainerRef}>
      <canvas id='mapEditorCanvas' ref={canvasRef}></canvas>
    </div>
  )
}
