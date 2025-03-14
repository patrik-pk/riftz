import React, { useState, useEffect } from 'react'
import './no-store-dialog.scss'
import Button from '@/components/general/button/Button'
import Close from '@/components/icons/close.svg'

type Position = 'center' | 'top-right'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  isOpened: boolean
  dialogTitle: React.ReactNode
  persistent?: boolean
  position?: Position
  onClose: () => void
}

const NoStoreDialog: React.FC<Props> = ({
  isOpened,
  className,
  dialogTitle,
  children,
  persistent,
  position = 'center',
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationTimeout, setAnimationTimeout] = useState<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (isOpened) {
      setIsAnimating(true)
      if (animationTimeout) {
        clearTimeout(animationTimeout)
      }
    }
  }, [isOpened])

  const classArray = ['dialog-wrapper', className, position]

  if (isAnimating && isOpened) {
    classArray.push('opened')
  }

  const handleWrapperClick = () => {
    if (persistent) return
    close()
  }

  const close = () => {
    onClose()

    setAnimationTimeout(
      setTimeout(() => {
        setIsAnimating(false)
      }, 500)
    )
  }

  if (!isOpened && !isAnimating) {
    return <></>
  }

  return (
    <>
      <div className={classArray.join(' ')} onClick={handleWrapperClick}>
        <div className='dialog' onClick={(e) => e.stopPropagation()}>
          <header className='header'>
            <p className='header-title'>{dialogTitle}</p>
            <Button
              className='close-button'
              icon={<Close />}
              iconSize='sm'
              variant='secondary'
              onClick={close}
            />
          </header>

          <div className='content'>{children}</div>
        </div>
      </div>
    </>
  )
}

export default NoStoreDialog
