import React, { useEffect, useRef, useState, useCallback } from 'react'
import classNames from 'classnames'
import './context-menu.scss'
import { createPortal } from 'react-dom'
import { isPointInBoundingBox } from '@/utils/utils'
import { IVector2 } from 'riftz-shared'

// TODO: implement a way to show only one menu at a time
export const ContextMenu: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null)
  const initializationElementRef = useRef<HTMLSpanElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [menuElement, setMenuElement] = useState<HTMLDivElement | null>(null)
  const [menuInitPosition, setMenuInitPosition] = useState<IVector2>({ x: 0, y: 0 })
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const menuElementRef = useRef<HTMLDivElement | null>(null)

  const handleMenuElement = useCallback((node: HTMLDivElement | null) => {
    setMenuElement(node)
  }, [])

  useEffect(() => {
    menuElementRef.current = menuElement

    if (!menuElementRef.current) {
      return
    }

    const { x, y } = menuInitPosition
    const menuStyleTemp: React.CSSProperties = {}

    if (x + (menuElementRef.current?.clientWidth ?? 0) >= window.innerWidth) {
      menuStyleTemp.right = window.innerWidth - x
    } else {
      menuStyleTemp.left = x
    }

    if (y + (menuElementRef.current?.clientHeight ?? 0) >= window.innerHeight) {
      menuStyleTemp.bottom = window.innerHeight - y
    } else {
      menuStyleTemp.top = y
    }

    setMenuStyle(menuStyleTemp)
  }, [menuElement])

  // create empty span on init that serves only to obtain the parent element
  useEffect(() => {
    if (!initializationElementRef.current) return
    setParentElement(initializationElementRef.current.parentNode as HTMLElement)
  }, [])

  useEffect(() => {
    if (!parentElement) return

    parentElement.addEventListener('contextmenu', (e) => {
      setMenuInitPosition({ x: e.x, y: e.y })
      setIsActive(true)
    })
  }, [parentElement])

  useEffect(() => {
    const hideHandle = (e: MouseEvent) => {
      const menuBoundingBox = menuElementRef.current?.getBoundingClientRect()
      const isMouseInBoundingBox = isPointInBoundingBox(menuBoundingBox, e)

      if (isMouseInBoundingBox) {
        return
      }

      setIsActive(false)
    }

    if (!isActive) {
      document.removeEventListener('mousedown', hideHandle)
      return
    }

    document.addEventListener('mousedown', hideHandle)
  }, [isActive])

  if (!parentElement) {
    return <span className='placeholder-context-menu' ref={initializationElementRef}></span>
  }

  if (!isActive) {
    return <></>
  }

  return createPortal(
    <div className={classNames('context-menu')} style={{ ...menuStyle }} ref={handleMenuElement}>
      {children}
    </div>,
    document.body
  )
}
