import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import {
  selectDataChanged,
} from '@/redux/reducers/animator'
import './load-data-dialog.scss'
import classNames from 'classnames'
import { loadData, MapData, openLoadDataDialog } from '@/redux/reducers/mapEditor'
import { MapEditorRenderer } from '@/components/map-editor/mapRenderer'

const DataObjectItem: React.FC<{ mapData: MapData }> = ({ mapData }) => {
  const dispatch = useStoreDispatch()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>()

  const data = useStoreSelector((state) => state.mapEditor.currentMapData)

  // const didDataChange = useSelector(selectDataChanged)

  const isMapCurrentlySelected = data?.id === mapData.id

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
      const mapRenderer = new MapEditorRenderer()
      mapRenderer.initializeCanvas(canvasRef.current, ctxRef.current)
      mapRenderer.loadMap(mapData)
      mapRenderer.map?.renderMapPreview(canvasRef.current, ctxRef.current)

      // const gameObjectRenderer = new GameObjectRenderer(canvasRef.current, ctxRef.current)

      // gameObjectRenderer.renderGameObject({
      //   data: dataObj,
      //   size: 40,
      //   waitForAssetsToDownload: true
      // })
    }

    renderPreview()
  }, [])

  const loadMap = () => {
    if (isMapCurrentlySelected) {
      return
    }

    // if (didDataChange && !confirm('Some data are unsaved, are you sure you want to proceed')) {
    //   return
    // }

    dispatch(loadData(mapData))
    dispatch(openLoadDataDialog(false))
  }

  return (
    <li
      className={classNames('object-item', { current: isMapCurrentlySelected })}
      onClick={() => loadMap()}
    >
      <div className='test-effect'></div>

      <div className='object-item-canvas-container'>
        <canvas className='object-item-canvas' ref={canvasRef}></canvas>
      </div>
      <div className='object-item-name'>{mapData.name}</div>
    </li>
  )
}

export default DataObjectItem
