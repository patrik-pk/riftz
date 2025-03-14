import { FC, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './menu.scss'
import { createPortal } from 'react-dom'
import { isPointInBoundingBox } from '../../../utils/utils'

interface Position {
  top?: number
  left?: number
  bottom?: number
  right?: number
}

export const Menu: FC<{
  children: React.ReactNode
  menuLocation?: 'top' | 'left' | 'bottom' | 'right' // relative to parent element
}> = ({ children, menuLocation = 'bottom' }) => {
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null)
  const initializationElementRef = useRef<HTMLSpanElement>(null)
  const [menuElement, setMenuElement] = useState<HTMLDivElement | null>(null)
  const [isActive, setIsActive] = useState(false)

  const handleMenuElement = useCallback((node: HTMLDivElement | null) => {
    setMenuElement(node)
  }, [])

  const menuPosition = useMemo<Position | undefined>(() => {
    if (!parentElement || !menuElement) {
      return
    }

    const parentElementRect = parentElement.getBoundingClientRect()
    const menuElementRect = menuElement.getBoundingClientRect()
    
    const position = ((): Position => {
      const offset = 10

      if (menuLocation === 'top') {
        return {
          left: parentElementRect.x + parentElementRect.width / 2 - menuElementRect.width / 2,
          top: parentElementRect.y - menuElementRect.height - offset
        }
      }
      if (menuLocation === 'left') {
        return {
          left: parentElementRect.x - menuElementRect.width - offset,
          top: parentElementRect.y + parentElementRect.height / 2 - menuElementRect.height / 2
        }
      }
      if (menuLocation === 'bottom') {
        return {
          left: parentElementRect.x + parentElementRect.width / 2 - menuElementRect.width / 2,
          top: parentElementRect.y + parentElementRect.height + offset
        }
      }
      return {
        left: parentElementRect.x + parentElementRect.width + offset,
        top: parentElementRect.y + parentElementRect.height / 2 - menuElementRect.height / 2
      }
    })()

    return position
  }, [parentElement, menuElement, menuLocation])


  // create empty span on init that serves only to obtain the parent element
  useEffect(() => {
    if (!initializationElementRef.current) return
    setParentElement(initializationElementRef.current.parentNode as HTMLElement)
  }, [])

  // handle open/close on parent element
  useEffect(() => {
    if (!parentElement) return

    const handleParentClick = () => {
      setIsActive(!isActive)
    }

    parentElement.addEventListener('mousedown', handleParentClick)
    
    return () => {
      parentElement.removeEventListener('mousedown', handleParentClick)
    }
  }, [parentElement, isActive])

  // handle close
  useEffect(() => {
    const hideHandle = (e: MouseEvent) => {
      const isMouseInParentBoundingBox = isPointInBoundingBox(parentElement?.getBoundingClientRect(), e)
      const isMouseInMenuBoundingBox = isPointInBoundingBox(menuElement?.getBoundingClientRect(), e)

      if (isMouseInMenuBoundingBox || isMouseInParentBoundingBox) {
        return
      }

      setIsActive(false)
    }

    if (!isActive) {
      document.removeEventListener('mousedown', hideHandle)
      return
    }

    document.addEventListener('mousedown', hideHandle)

    return () => {
      document.removeEventListener('mousedown', hideHandle)
    }
  }, [isActive, parentElement, menuElement])

  if (!parentElement) {
    return <span className='placeholder-x-menu' ref={initializationElementRef}></span>
  }
  
  if (!isActive) {
    return <></>
  }

  return createPortal(
    <div className="x-menu" style={{ ...menuPosition }} ref={handleMenuElement}>
      { children}
    </div>,
    document.body
  )
}