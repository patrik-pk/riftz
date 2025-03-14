import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import {
  loadData,
  openLoadDataDialog,
  selectDataChanged,
  selectNode,
  setSelectedAnimationId,
} from '@/redux/reducers/animator'
import './load-data-dialog.scss'
import { GameObjectRenderer, IDefinedObject } from '../../gameObjectRenderer'
import classNames from 'classnames'

const DataObjectItem: React.FC<{ dataObj: IDefinedObject }> = ({ dataObj }) => {
  const dispatch = useStoreDispatch()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>()

  const data = useStoreSelector((state) => state.animator.data)

  const didDataChange = useSelector(selectDataChanged)

  const isCurrent = data?.name === dataObj.name

  useEffect(() => {
    if (!canvasRef.current) return

    ctxRef.current = canvasRef.current.getContext('2d')

    if (!ctxRef.current) return

    const renderPreview = () => {
      if (!canvasRef.current || !ctxRef.current) {
        return
      }

      ctxRef.current.setTransform(1, 0, 0, 1, 0, 0)
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      canvasRef.current.width = canvasRef.current.clientWidth
      canvasRef.current.height = canvasRef.current.clientHeight
      ctxRef.current.translate(canvasRef.current.width / 2, canvasRef.current.height / 2)
      const gameObjectRenderer = new GameObjectRenderer(canvasRef.current, ctxRef.current)

      gameObjectRenderer.renderGameObject({
        data: dataObj,
        size: 40,
        waitForAssetsToDownload: true
      })
    }

    renderPreview()
  }, [])

  return (
    <li
      className={classNames('object-item', { current: isCurrent })}
      onClick={() => {
        if (isCurrent) {
          return
        }

        if (didDataChange && !confirm('Some data are unsaved, are you sure you want to proceed')) {
          return
        }

        dispatch(loadData(dataObj))
        dispatch(openLoadDataDialog(false))
        dispatch(setSelectedAnimationId(null))
        dispatch(selectNode(null))
      }}
    >
      <div className='test-effect'></div>

      <div className='object-item-canvas-container'>
        <canvas className='object-item-canvas' ref={canvasRef}></canvas>
      </div>
      <div className='object-item-name'>{dataObj.name}</div>
    </li>
  )
}

export default DataObjectItem
