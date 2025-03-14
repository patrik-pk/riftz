import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'
import './tooltip.scss'
import { constrainValue } from '@/utils/utils'

interface TooltipCoordinatesStyle {
  top?: number
  bottom?: number
  right?: number
  left?: number
  transform?: string
}

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

// TODO: implement tooltip boundaries (handle page overflow)
const Tooltip: React.FC<{
  className?: string
  children: React.ReactNode
  position?: TooltipPosition
  offset?: number
}> = ({ children, position = 'top', offset = 10, className }) => {
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null)
  const [isParentHovered, setIsParentHovered] = useState(false)
  const [tooltipCoordinatesStyle, setTooltipStyle] = useState<TooltipCoordinatesStyle>({})
  const initializationElementRef = useRef<HTMLSpanElement>(null)

  const [tooltipElement, setTooltipElement] = useState<HTMLDivElement | null>(null)

  const handleTooltipElement = useCallback((node: HTMLDivElement | null) => {
    setTooltipElement(node)
  }, [])

  const calculateTooltipCoordinates = (): TooltipCoordinatesStyle => {
    if (!parentElement || !tooltipElement) {
      return {}
    }

    const parentRect = parentElement.getBoundingClientRect()
    const tooltipRect = tooltipElement.getBoundingClientRect()
    
    const constrainValueHorizontally = (value: number, tooltipWidth: number) => {
      return constrainValue(value, offset, window.innerWidth - offset - tooltipWidth)
    }

    const constrainValueVertically = (value: number, tooltipHeight: number) => {
      return constrainValue(value, offset, window.innerWidth - offset - tooltipHeight)
    }

    if (position === 'bottom') {
      let top = constrainValueVertically(parentRect.y + parentRect.height + offset, tooltipRect.height)
      let left = constrainValueHorizontally(parentRect.x + parentRect.width / 2 - tooltipRect.width / 2, tooltipRect.width)

      return {
        top,
        left,
      }
    } else if (position === 'top') {
      let top = constrainValueVertically(parentRect.y - offset - tooltipRect.height, tooltipRect.height)
      let left = constrainValueHorizontally(parentRect.x + parentRect.width / 2 - tooltipRect.width / 2, tooltipRect.width)

      return {
        top,
        left,
      }
    } else if (position === 'left') {
      let top = constrainValueVertically(parentRect.y + parentRect.height / 2 - tooltipRect.height / 2, tooltipRect.height)
      let left = constrainValueHorizontally(parentRect.x - offset - tooltipRect.width, tooltipRect.width)

      return {
        top,
        left,
      }
    } else {
      let top = constrainValueVertically(parentRect.y + parentRect.height / 2 - tooltipRect.height / 2, tooltipRect.height)
      let left = constrainValueHorizontally(parentRect.x + parentRect.width + offset, tooltipRect.width)

      return {
        top,
        left,
      }
    }
  }

  // create empty span on init that serves only to obtain the parent element
  useEffect(() => {
    if (!initializationElementRef.current) return
    setParentElement(initializationElementRef.current.parentNode as HTMLElement)
  }, [])

  // on "mouseenter" calculate the tooltips position and display it, on "mouseleave" simply hide it
  useEffect(() => {
    if (!parentElement) return

    parentElement.addEventListener('mouseenter', () => {
      setIsParentHovered(true)
    })
    parentElement.addEventListener('mouseleave', () => {
      setIsParentHovered(false)
    })
  }, [parentElement])

  useEffect(() => {
    if (tooltipElement) {
      const coordinates = calculateTooltipCoordinates()
      setTooltipStyle(coordinates)
    }
  }, [tooltipElement])

  if (!parentElement) {
    return <span ref={initializationElementRef}></span>
  }
  
  if (!isParentHovered) {
    return <></>
  }

  return createPortal(
    <div className={classNames('tooltip', className)} style={tooltipCoordinatesStyle} ref={handleTooltipElement}>
      {children}
    </div>,
    document.body
  )
}

export default Tooltip
