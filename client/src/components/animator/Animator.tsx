import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import './animator.scss'
import Home from '@/components/icons/home.svg'
import GoDataJSON from '@/data/gameObjects/svg-test.json'
import Button from '@/components/general/button/Button'
import { Viewport } from '@/components/animator/viewport/Viewport'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import {
  AssetData,
  loadData,
  loadSettingsFromLocalStorage,
  openLoadDataDialog,
  selectDataChanged,
  selectNode,
  setAssets,
} from '@/redux/reducers/animator'
import { setRoute } from '@/redux/reducers/route'
import { Hierarchy } from './hierarchy/Hierarchy'
import { Inspector } from './inspector/Inspector'
import { IDefinedObject } from './gameObjectRenderer'
import api from '@/api/api'
import store from '@/redux/store'
import TabMenu from './tab-menu/TabMenu'
import ChangeNodeParent from './dialogs/changeNodeParent/ChangeNodeParent'
import AddNodeDialog from '@/components/animator/dialogs/addNodeDialog/AddNodeDialog'
import EditIdDialog from '@/components/animator/dialogs/editId/EditIdDialog'
import Animations from '@/components/animator/animations/Animations'
import ChangeAssetDialog from '@/components/animator/dialogs/changeAssetDialog/ChangeAssetDialog'
import LoadDataDialog from './dialogs/loadDataDialog/LoadDataDialog'
import { ContextMenu } from '../general/context-menu/ContextMenu'
import { usePanelExpander } from '@/hooks/usePanelExpander'

const Animator = () => {
  const dispatch = useStoreDispatch()

  const data = useStoreSelector((state) => state.animator.data)

  const didDataChange = useSelector(selectDataChanged)

  type ItemRight = 'Inspector' | 'Animator'
  const [activeItemRight, setActiveItemRight] = useState<ItemRight>('Inspector')

  const panelExpander = usePanelExpander(300, 400)

  useEffect(() => {
    dispatch(loadSettingsFromLocalStorage())
    loadAssets()
    dispatch(loadData(GoDataJSON as IDefinedObject))

    const saveSettingsToLocalStorage = () => {
      const state = store.getState().animator

      const settings = {
        debugHitbox: state.debugHitbox,
        objectRotation: state.objectRotation,
        objectSize: state.objectSize,
        debugPivotPoint: state.debugPivotPoint,
        showGrid: state.showGrid,
      }

      localStorage.setItem('editor-settings', JSON.stringify(settings))
    }

    window.addEventListener('beforeunload', saveSettingsToLocalStorage)

    return () => {
      window.removeEventListener('beforeunload', saveSettingsToLocalStorage)
      saveSettingsToLocalStorage()
    }
  }, [])

  const loadAssets = async () => {
    type GetAssetsResponse = AssetData<string>[]

    const data = await api.get<GetAssetsResponse>('files/get-assets')
    if (!data) {
      return
    }

    const dataWithEndpoint: AssetData[] = []
    data.forEach((item) => {
      dataWithEndpoint.push({
        category: item.category,
        assets: item.assets.map((asset) => {
          return {
            name: asset,
            url: `${api.apiUrl}/assets/${item.category}/${asset}`,
          }
        }),
      })
    })

    dispatch(setAssets(dataWithEndpoint))
  }

  const copyJSON = () => {
    const jsonData = JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(jsonData)
  }

  const loadDataDialog = () => {
    dispatch(openLoadDataDialog(true))
  }

  return (
    <div
      className='animator'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          dispatch(selectNode(null))
        }
      }}
    >
      <ContextMenu>
        <div className='custom-context-menu'>Menu</div>
      </ContextMenu>

      <header className='animator__header'>
        <div className='header-left'>
          <Button icon={<Home />} variant='secondary' onClick={() => dispatch(setRoute('GAME'))} />
          {didDataChange && <Button>Save</Button>}
          <Button variant='secondary' onClick={copyJSON}>
            Copy JSON
          </Button>
          <Button variant='primary' onClick={loadDataDialog}>
            Load
          </Button>
        </div>
        <div className='header-right'></div>
      </header>

      <div
        className='animator-middle'
        style={{ gridTemplateColumns: `${panelExpander.leftPanelWidth}px 1fr ${panelExpander.rightPanelWidth}px` }}
      >
        <div className='animator-middle-tile left'>
          <TabMenu items={['Hierarchy']} activeItem='Hierarchy' />
          <Hierarchy />

          <div
            className='animator-expand-bar left'
            onMouseDown={() => panelExpander.setExpandingColumn('left')}
          ></div>
        </div>

        <div className='animator-middle-tile middle'>
          <TabMenu items={['Viewport']} activeItem='Viewport' />
          <Viewport />
        </div>

        <div className='animator-middle-tile right'>
          <TabMenu
            items={['Inspector', 'Animator'] as ItemRight[]}
            activeItem={activeItemRight}
            onItemChange={(item) => setActiveItemRight(item as ItemRight)}
          />
          {activeItemRight === 'Inspector' && <Inspector />}
          {activeItemRight === 'Animator' && <Animations />}

          <div
            className='animator-expand-bar right'
            onMouseDown={() => panelExpander.setExpandingColumn('right')}
          ></div>
        </div>
      </div>

      <AddNodeDialog />
      <ChangeNodeParent />
      <EditIdDialog />
      <ChangeAssetDialog />
      <LoadDataDialog />
    </div>
  )
}

export default Animator
