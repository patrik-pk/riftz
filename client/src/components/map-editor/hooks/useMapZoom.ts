import { useEffect } from 'react'
import { mapEditorRenderer } from '@/components/map-editor/mapRenderer'

export const useMapZoom = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  useEffect(() => {
    if (!canvasRef.current) return

    canvasRef.current.addEventListener('wheel', (e) => {
      e.preventDefault()
      const zoomSpeed = 1.3
      const scale = e.deltaY > 0 ? 1 / zoomSpeed : zoomSpeed

      mapEditorRenderer.zoom *= scale
      mapEditorRenderer.zoom = Math.max(mapEditorRenderer.zoom, 0.1)
    })
  }, [])
}
