import { useState, FormEvent, useRef, useEffect } from 'react'
import NoStoreDialog from '@/components/general/noStoreDialog/NoStoreDialog'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { loadData, MapData, openCreateNewMapDialog } from '@/redux/reducers/mapEditor'
import './create-new-map-dialog.scss'
import Button from '@/components/general/button/Button'
import Input from '@/components/general/input/Input'
import Cube from '@/components/icons/cube.svg'
import { MapEditorRenderer } from '@/components/map-editor/mapRenderer'
import Slider from '@/components/general/slider/Slider'

// TODO:
// seed input randomize button

const generateRandomNumberString = (): string => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
}

type FormInputKey = keyof Pick<MapData, 'name' | 'seed' | 'mapWidth' | 'mapHeight' | 'fillPercentage' | 'tileSize'>

type FormInputs = Record<FormInputKey, string>

const CreateNewMapDialog = () => {
  const dispatch = useStoreDispatch()
  const isOpened = useStoreSelector((state) => state.mapEditor.createNewMapDialogOpened)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>()

  const mapRenderer = new MapEditorRenderer()

  const [formInputs, setFormInputs] = useState<FormInputs>({
    name: 'Test Map',
    seed: 'default seed',
    mapWidth: '50',
    mapHeight: '50',
    fillPercentage: '0.5',
    tileSize: '10'
  })

  useEffect(() => {
    if (!canvasRef.current) return

    ctxRef.current = canvasRef.current.getContext('2d')

    if (!ctxRef.current) return

    const initializePreviewRenderer = () => {
      if (!canvasRef.current || !ctxRef.current) {
        return
      }

      ctxRef.current.setTransform(1, 0, 0, 1, 0, 0)
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      canvasRef.current.width = canvasRef.current.clientWidth
      canvasRef.current.height = canvasRef.current.clientHeight
      ctxRef.current.translate(canvasRef.current.width / 2, canvasRef.current.height / 2)
      mapRenderer.initializeCanvas(canvasRef.current, ctxRef.current)
    }

    initializePreviewRenderer()
    renderPreview()
  }, [isOpened])

  useEffect(() => {
    renderPreview()
  }, [formInputs])

  const randomizeSeed = () => {
    setFormInputs({
      ...formInputs,
      seed: generateRandomNumberString()
    })
  }

  const renderPreview = () => {
    if (!canvasRef.current || !ctxRef.current) return

    mapRenderer.loadMap({
      seed: formInputs.seed,
      mapWidth: Number(formInputs.mapWidth),
      mapHeight: Number(formInputs.mapHeight),
      fillPercentage: Number(formInputs.fillPercentage),
      tileSize: Number(formInputs.tileSize)
    })
    mapRenderer.map?.renderMapPreview(canvasRef.current, ctxRef.current)
  }

  const createMap = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(
      loadData({
        id: formInputs.name.toLowerCase(), // TODO: lower case, split words with "-"
        name: formInputs.name,
        seed: formInputs.seed,
        mapWidth: Number(formInputs.mapWidth),
        mapHeight: Number(formInputs.mapHeight),
        fillPercentage: Number(formInputs.fillPercentage),
        tileSize: Number(formInputs.tileSize)
      })
    )
    dispatch(openCreateNewMapDialog(false))
  }

  return (
    <NoStoreDialog
      className="create-new-map-dialog"
      dialogTitle="Create New Map"
      isOpened={isOpened}
      onClose={() => dispatch(openCreateNewMapDialog(false))}
    >
      <div className="cnm-content">
        <div className="preview">
          <div className="preview-content">
            <canvas className="preview-canvas" ref={canvasRef}></canvas>
          </div>
        </div>
        <form className="cnm-content-right" onSubmit={createMap}>
          <div className="ccr-inputs">
            <Input
              label={'Name'}
              variant="secondary"
              required
              value={formInputs.name}
              onChange={(e) => setFormInputs({ ...formInputs, name: e.target.value })}
            />
            <div className="seed-input-container">
              <Input
                label={'Seed'}
                variant="secondary"
                required
                value={formInputs.seed}
                onChange={(e) => setFormInputs({ ...formInputs, seed: e.target.value })}
              ></Input>
              <Button variant="secondary" icon={<Cube />} onClick={() => randomizeSeed()}></Button>
            </div>
            <Input
              label={'Tiles X'}
              variant="secondary"
              type="number"
              required
              value={formInputs.mapWidth}
              onChange={(e) => setFormInputs({ ...formInputs, mapWidth: e.target.value })}
            />
            <Input
              label={'Tiles Y'}
              variant="secondary"
              required
              type="number"
              value={formInputs.mapHeight}
              onChange={(e) => setFormInputs({ ...formInputs, mapHeight: e.target.value })}
            />

            <Slider
              label="Fill amount slider"
              variant="secondary"
              min={0}
              max={1}
              step={0.05}
              value={formInputs.fillPercentage}
              onValueChange={(value) => {
                setFormInputs({
                  ...formInputs,
                  fillPercentage: String(value)
                })
              }}
            />
            <Input
              label={'Tile size'}
              variant="secondary"
              type={'number'}
              required
              value={formInputs.tileSize}
              onChange={(e) => setFormInputs({ ...formInputs, tileSize: e.target.value })}
            />
          </div>

          <div className="ccr-actions">
            <Button type={'submit'}>Create</Button>
          </div>
        </form>
      </div>
    </NoStoreDialog>
  )
}

export default CreateNewMapDialog
