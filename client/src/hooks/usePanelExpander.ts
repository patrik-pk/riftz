import { useEffect, useState } from 'react'

// shared logic for Animator and Map Editor
export const usePanelExpander = (initialLeftPanelWidth: number, initialRightPanelWidth: number) => {
  type Panel = 'left' | 'right'
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(initialLeftPanelWidth)
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(initialRightPanelWidth)
  const [expandingColumn, setExpandingColumn] = useState<Panel | null>(null)

  useEffect(() => {
    const handleExpand = (e: MouseEvent) => {
      if (expandingColumn === 'left') {
        setLeftPanelWidth(Math.max(e.clientX, 100))
      }
      if (expandingColumn === 'right') {
        setRightPanelWidth(Math.max(window.innerWidth - e.clientX, 100))
      }
    }

    if (expandingColumn) {
      document.addEventListener('mousemove', handleExpand)
    }

    return () => {
      document.removeEventListener('mousemove', handleExpand)
    }
  }, [expandingColumn])

  useEffect(() => {
    document.addEventListener('mouseup', () => {
      setExpandingColumn(null)
    })
  }, [])

  return {
    leftPanelWidth,
    rightPanelWidth,
    setExpandingColumn
  }
}
