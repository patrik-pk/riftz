import { MapConstructorObj } from '@/components/map-editor/map'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import TestMap from '@/data/maps/test-map.json'
import TestMap2 from '@/data/maps/test-map2.json'
import { mapEditorRenderer } from '@/components/map-editor/mapRenderer'

export const allMapDataArray: MapData[] = [TestMap, TestMap2]

export const allMapData: Record<string, MapData> = allMapDataArray.reduce(
  (acc, map) => {
    acc[map.id] = map
    return acc
  },
  {} as Record<string, MapData>
)

export interface MapData extends Required<MapConstructorObj> {
  id: string
  name: string
  activeColor?: string
  inactiveColor?: string
  wallColor?: string
}

export interface DebugOptions {
  renderBase: boolean
  renderCoordinates: boolean
  renderMesh: boolean
  renderSquareNodes: boolean
}

interface MapEditorState {
  currentMapData: MapData | null
  loadDataDialogOpened: boolean
  createNewMapDialogOpened: boolean
  debugOptions: DebugOptions
}

const initialState: MapEditorState = {
  currentMapData: null,
  loadDataDialogOpened: false,
  createNewMapDialogOpened: false,
  debugOptions: {
    renderBase: false,
    renderCoordinates: false,
    renderMesh: true,
    renderSquareNodes: false
  }
}

const mapEditorSlice = createSlice({
  name: 'map-editor',
  initialState,
  reducers: {
    loadData(state, action: PayloadAction<MapData | null>) {
      state.currentMapData = action.payload
      mapEditorRenderer.loadMap(action.payload)
    },
    setGroundColor(state, action: PayloadAction<string>) {
      if (!state.currentMapData) return
      // state.currentMapData.groundColor = action.payload
    },
    openLoadDataDialog: (state, action: PayloadAction<boolean>) => {
      state.loadDataDialogOpened = action.payload
    },
    openCreateNewMapDialog: (state, action: PayloadAction<boolean>) => {
      state.createNewMapDialogOpened = action.payload
    },
    setDebugOptions: (state, action: PayloadAction<DebugOptions>) => {
      state.debugOptions = action.payload
    },
    updateData(state, action: PayloadAction<Partial<MapData>>) {
      state.currentMapData = {
        ...state.currentMapData,
        ...action.payload
      } as MapData
    }
  }
})

export const { loadData, updateData, setGroundColor, openLoadDataDialog, openCreateNewMapDialog, setDebugOptions } =
  mapEditorSlice.actions

export default mapEditorSlice.reducer
