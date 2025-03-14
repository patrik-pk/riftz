import { mapEditorRenderer } from '@/components/map-editor/mapRenderer'
import handleCanvasResize from '@/logic/handleCanvasResize'
import { useStoreSelector } from '@/redux/hooks'
import { useEffect, useRef } from 'react'

export const useMapRenderer = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  canvasContainerRef: React.RefObject<HTMLDivElement | null>
) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const requestRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const mapData = useStoreSelector((state) => state.mapEditor.currentMapData)
  const debugOptions = useStoreSelector((state) => state.mapEditor.debugOptions)

  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return

    ctxRef.current = canvasRef.current.getContext('2d')

    if (!ctxRef.current) return

    mapEditorRenderer.initializeCanvas(canvasRef.current, ctxRef.current)
    handleCanvasResize(ctxRef.current)

    const render = () => {
      if (!canvasRef.current || !ctxRef.current || !mapData) return
      mapEditorRenderer.render()
      requestRef.current = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      if (requestRef.current !== null) {
        window.cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])
}
