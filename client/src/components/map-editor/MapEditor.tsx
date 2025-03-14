import { useEffect } from 'react'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import './map-editor.scss'
import { setRoute } from '@/redux/reducers/route'
import Home from '@/components/icons/home.svg'
import Button from '@/components/general/button/Button'
import { MapEditorViewport } from '@/components/map-editor/viewport/MapEditorViewport'
import { allMapData, loadData, MapData, openCreateNewMapDialog, openLoadDataDialog } from '@/redux/reducers/mapEditor'
import TabMenu from '@/components/animator/tab-menu/TabMenu'
import { usePanelExpander } from '@/hooks/usePanelExpander'
import { RightPanelContent } from './RightPanelContent'
import LoadDataDialog from '@/components/map-editor/dialogs/loadDataDialog/LoadDataDialog'
import CreateNewMapDialog from '@/components/map-editor/dialogs/create-new-map/CreateNewMapDialog'

export const MapEditor = () => {
  const dispatch = useStoreDispatch()
  const currentMapData = useStoreSelector((state) => state.mapEditor.currentMapData)
  const loadDataDialogOpened = useStoreSelector((state) => state.mapEditor.loadDataDialogOpened)

  const panelExpander = usePanelExpander(300, 300)

  useEffect(() => {
    dispatch(loadData(allMapData['test-map']))
  }, [])

  const copyJSON = () => {
    const jsonData = JSON.stringify(currentMapData, null, 2)
    navigator.clipboard.writeText(jsonData)
  }

  const loadDataDialog = () => {
    // TODO: continue with load data dialog
    dispatch(openLoadDataDialog(true))
  }

  const createNewMap = () => {
    dispatch(openCreateNewMapDialog(true))
  }

  return (
    <div className="map-editor">
      <header className="me-header">
        <Button icon={<Home />} variant="secondary" onClick={() => dispatch(setRoute('GAME'))} />
        <Button variant="secondary" onClick={copyJSON}>
          Copy JSON
        </Button>
        <Button variant="primary" onClick={loadDataDialog}>
          Load
        </Button>
        <Button variant="primary" onClick={createNewMap}>
          New
        </Button>
      </header>

      {currentMapData ? (
        <>
          {/* 
                left panel:
                - patterns (textures)
                - obstacles
                - spawners  
                */}
          <main
            className="me-main"
            style={{ gridTemplateColumns: `${panelExpander.leftPanelWidth}px 1fr ${panelExpander.rightPanelWidth}px` }}
          >
            <div className="me-panel-left me-tile left">
              <TabMenu items={['Panel']} activeItem="Panel" />
              panel
              <div
                className="animator-expand-bar left"
                onMouseDown={() => panelExpander.setExpandingColumn('left')}
              ></div>
            </div>
            <MapEditorViewport />
            <div className="me-panel-right me-tile right">
              <TabMenu items={['Panel']} activeItem="Panel" />
              <RightPanelContent />

              <div
                className="animator-expand-bar right"
                onMouseDown={() => panelExpander.setExpandingColumn('right')}
              ></div>
            </div>
          </main>
          {/* 
                right panel:
                 - general settings (map size, ground color)  
              */}
        </>
      ) : (
        <>no map data selected</>
      )}

      <LoadDataDialog />
      <CreateNewMapDialog />
    </div>
  )
}
