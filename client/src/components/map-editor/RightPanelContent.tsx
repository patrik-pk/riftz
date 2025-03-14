import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useStoreDispatch, useStoreSelector } from '../../redux/hooks'
import { setDebugOptions, setGroundColor, updateData } from '../../redux/reducers/mapEditor'
import { Menu } from '../general/menu/Menu'
import Input from '../general/input/Input'
import Checkbox from '@/components/general/checkbox/checkbox'
import { ColorPicker } from '../general/color-picker/ColorPicker'

export const RightPanelContent = () => {
  const currentMapData = useStoreSelector((state) => state.mapEditor.currentMapData)
  const debugOptions = useStoreSelector((state) => state.mapEditor.debugOptions)
  const dispatch = useStoreDispatch()
  const [testColor, setTestColor] = useState<string | undefined>()

  if (!currentMapData) {
    return <>no data</>
  }

  return (
    <div className="right-panel-content">
      <div className="name">{currentMapData.name}</div>

      <div className="map-properties">
        <div className="property-item">
          <div className="property-item-label">Seed:</div>
          <div className="property-item-value">{currentMapData.seed}</div>
        </div>
        <div className="property-item">
          <div className="property-item-label">Map width:</div>
          <div className="property-item-value">{currentMapData.mapWidth}</div>
        </div>
        <div className="property-item">
          <div className="property-item-label">Map height:</div>
          <div className="property-item-value">{currentMapData.mapHeight}</div>
        </div>
        <div className="property-item">
          <div className="property-item-label">Fill amount:</div>
          <div className="property-item-value">{currentMapData.fillPercentage}</div>
        </div>
        <div className="property-item">
          <div className="property-item-label">Tile size:</div>
          <div className="property-item-value">{currentMapData.tileSize}</div>
        </div>
      </div>

      <div className="map-colors">
        <ColorPicker
          label="Active color"
          value={currentMapData.activeColor}
          onColorChange={(color) => dispatch(updateData({ activeColor: color }))}
        />
        <ColorPicker
          label="Inactive color"
          value={currentMapData.inactiveColor}
          onColorChange={(color) => dispatch(updateData({ inactiveColor: color }))}
        />
        <ColorPicker
          label="Wall color"
          value={currentMapData.wallColor}
          onColorChange={(color) => dispatch(updateData({ wallColor: color }))}
        />
      </div>

      <div className="debug-options">
        <Checkbox
          label="Debug base"
          isChecked={debugOptions.renderBase}
          onChange={() => dispatch(setDebugOptions({ ...debugOptions, renderBase: !debugOptions.renderBase }))}
        />
        <Checkbox
          label="Render mesh"
          isChecked={debugOptions.renderMesh}
          onChange={() => dispatch(setDebugOptions({ ...debugOptions, renderMesh: !debugOptions.renderMesh }))}
        />
        <Checkbox
          label="Debug coordinates"
          isChecked={debugOptions.renderCoordinates}
          onChange={() =>
            dispatch(setDebugOptions({ ...debugOptions, renderCoordinates: !debugOptions.renderCoordinates }))
          }
        />
        <Checkbox
          label="Debug square nodes"
          isChecked={debugOptions.renderSquareNodes}
          onChange={() =>
            dispatch(setDebugOptions({ ...debugOptions, renderSquareNodes: !debugOptions.renderSquareNodes }))
          }
        />
      </div>
    </div>
  )
}
