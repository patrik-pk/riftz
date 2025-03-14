import React, { useState, useEffect } from 'react'
import './dialog.scss'
import Button from '@/components/general/button/Button'
import Close from '@/components/icons/close.svg'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { DialogId, closeDialog } from '@/redux/reducers/dialog'

type Position = 'center' | 'top-right'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  id: DialogId
  dialogTitle: React.ReactNode
  persistent?: boolean
  position?: Position
  onClose?: ()=> void
}

const Dialog: React.FC<Props> = ({
  id,
  className,
  dialogTitle,
  children,
  persistent,
  position = 'center',
  onClose
}) => {
  const dialog = useStoreSelector(state => state.dialog.dialogs[id])
  const dispatch = useStoreDispatch()

  const [isAnimating, setIsAnimating] = useState(false)
  const [animationTimeout, setAnimationTimeout] = useState<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (dialog.isOpened) {
      setIsAnimating(true)
      if (animationTimeout) {
        clearTimeout(animationTimeout)
      }
    }
  }, [dialog.isOpened])

  const classArray = ['dialog-wrapper', className, position]

  if (isAnimating && dialog.isOpened) {
    classArray.push('opened')
  }

  const handleWrapperClick = () => {
    if (persistent) return
    close()
  }

  const close = () => {
    dispatch(closeDialog(id))
    onClose?.()

    setAnimationTimeout(setTimeout(() => {
      setIsAnimating(false)
    }, 500))
  }

  if (!dialog.isOpened && !isAnimating) {
    return <></>
  }

  return (
    <>
      <div className={classArray.join(' ')} id={`${id}-dialog`} onClick={handleWrapperClick}>
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

export default Dialog
