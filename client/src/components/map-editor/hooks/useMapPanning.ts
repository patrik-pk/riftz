import { mapEditorRenderer } from '@/components/map-editor/mapRenderer'
import { useEffect, useState } from 'react'
import { IVector2 } from 'riftz-shared'

export const useMapPanning = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [isPanning, setIsPanning] = useState<boolean>(false)

  useEffect(() => {
    if (!canvasRef.current) return

    canvasRef.current.addEventListener('mousedown', () => setIsPanning(true))
    canvasRef.current.addEventListener('mouseup', () => setIsPanning(false)) // TODO: bind mouseup event to window
  }, [])

  useEffect(() => {
    const handlePanning = (e: MouseEvent) => {
      if (!canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const currentMousePosition: IVector2 = { x: 0, y: 0 }
      currentMousePosition.x = (e.clientX - rect.left) / rect.width
      currentMousePosition.y = (e.clientY - rect.top) / rect.height

      if (!mapEditorRenderer.lastMousePosition) {
        mapEditorRenderer.lastMousePosition = { x: currentMousePosition.x, y: currentMousePosition.y }
        return
      }

      const diff: IVector2 = {
        x: mapEditorRenderer.lastMousePosition.x - currentMousePosition.x,
        y: mapEditorRenderer.lastMousePosition.y - currentMousePosition.y
      }

      const panningSpeed = 1000 / mapEditorRenderer.zoom
      mapEditorRenderer.cameraPosition.x += diff.x * panningSpeed
      mapEditorRenderer.cameraPosition.y += diff.y * panningSpeed
      mapEditorRenderer.lastMousePosition = { x: currentMousePosition.x, y: currentMousePosition.y }
    }

    if (isPanning) {
      document.addEventListener('mousemove', handlePanning)
    }

    return () => {
      document.removeEventListener('mousemove', handlePanning)
      mapEditorRenderer.lastMousePosition = null
    }
  }, [isPanning])
}
