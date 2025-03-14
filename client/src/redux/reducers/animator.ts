import { v4 as uuidv4 } from 'uuid'
import {
  AnimatableKey,
  AnimationRenderObj,
  IDefinedObject,
  IDefinedObjectPart
} from '@/components/animator/gameObjectRenderer'
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

export const defaultObjectSize = 50

const formatId = (id: string) => {
  return id.toLowerCase().split(' ').join('-')
}

interface AssetItem {
  name: string
  url: string
}

export interface AssetData<T = AssetItem> {
  category: string
  assets: T[]
}

type EditIdType = 'inspector' | 'animator'

interface AnimatorState {
  data: IDefinedObject | null
  originalData: IDefinedObject | null
  selectedNodeId: string | null
  debugHitbox: boolean
  debugPivotPoint: boolean
  objectRotation: number
  objectSize: number
  showGrid: boolean
  assetImages: AssetData[]
  addNodeParentId: string | null
  currentAnimation: AnimationRenderObj | null
  selectedAnimationId: string | null

  changeParentDialogOpened: boolean
  assetDialogOpened: boolean
  editIdDialogOpened: boolean
  editIdInput: string
  editIdType: EditIdType
  addNodeDialogOpened: boolean
  loadDataDialogOpened: boolean
}

const initialState: AnimatorState = {
  data: null,
  originalData: null,
  selectedNodeId: null,
  debugHitbox: false,
  debugPivotPoint: false,
  objectRotation: 0,
  objectSize: defaultObjectSize,
  showGrid: true,
  assetImages: [],
  addNodeParentId: null,
  currentAnimation: null,
  selectedAnimationId: null,

  changeParentDialogOpened: false,
  assetDialogOpened: false,
  editIdDialogOpened: false,
  editIdInput: '',
  editIdType: 'inspector',
  addNodeDialogOpened: false,
  loadDataDialogOpened: false
}

const setDeep = (obj: any, path: string, value: any) => {
  const props = typeof path === 'string' ? path.split('.') : path
  for (var i = 0, n = props.length - 1; i < n; ++i) {
    obj = obj[props[i]] = obj[props[i]] || {}
  }
  obj[props[i]] = value
  return obj
}

export const selectData = (state: RootState) => state.animator.data
export const selectOriginalData = (state: RootState) => state.animator.originalData

export const selectDataChanged = createSelector([selectData, selectOriginalData], (data, originalData) => {
  return JSON.stringify(data) !== JSON.stringify(originalData)
})

const animatorSlice = createSlice({
  name: 'animator',
  initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload
    },
    loadData: (state, action: PayloadAction<IDefinedObject | null>) => {
      state.data = action.payload
      state.originalData = action.payload
    },
    updateNode: (
      state,
      action: PayloadAction<{
        id: string
        newNodeData: IDefinedObjectPart
      }>
    ) => {
      if (!state.data) {
        return
      }

      state.data.parts[action.payload.id] = action.payload.newNodeData
    },
    updateNodeProperty: (
      state,
      action: PayloadAction<{
        nodeId: string
        propertyPath: string
        propertyValue: any
      }>
    ) => {
      if (!state.data) {
        return
      }

      const { nodeId, propertyPath, propertyValue } = action.payload
      setDeep(state.data.parts[nodeId], propertyPath, propertyValue)
    },
    clearNodeProperty: (
      state,
      action: PayloadAction<{
        nodeId: string
        property: string
      }>
    ) => {
      if (!state.data || !state.data.parts[action.payload.nodeId]) {
        return
      }

      const { nodeId, property } = action.payload

      // @ts-ignore
      state.data.parts[nodeId][property] = state.originalData?.parts[nodeId][property]
    },
    setNodeAsset: (state, action: PayloadAction<string>) => {
      if (!state.selectedNodeId || !state.data) {
        return
      }

      state.data.parts[state.selectedNodeId].assetUrl = action.payload
    },
    setAssets: (state, action: PayloadAction<AssetData[]>) => {
      state.assetImages = action.payload
    },
    clearNode: (state, action: PayloadAction<{ nodeId: string }>) => {
      if (!state.data || !state.originalData || !state.data.parts[action.payload.nodeId]) {
        return
      }

      state.data.parts[action.payload.nodeId] = state.originalData.parts[action.payload.nodeId]
    },
    setDebugHitbox: (state, action: PayloadAction<boolean>) => {
      state.debugHitbox = action.payload
    },
    setDebugPivotPoint: (state, action: PayloadAction<boolean>) => {
      state.debugPivotPoint = action.payload
    },
    setObjectRotation: (state, action: PayloadAction<number>) => {
      state.objectRotation = action.payload
    },
    setObjectSize: (state, action: PayloadAction<number>) => {
      state.objectSize = action.payload
    },
    setShowGrid: (state, action: PayloadAction<boolean>) => {
      state.showGrid = action.payload
    },
    setAddNodeDialogOpened: (state, action: PayloadAction<boolean>) => {
      state.addNodeDialogOpened = action.payload
    },
    setAddNodeParentId: (state, action: PayloadAction<string | null>) => {
      state.addNodeParentId = action.payload
    },
    addNewNode: (
      state,
      action: PayloadAction<{
        id: string
      }>
    ) => {
      if (!state.data) {
        return
      }

      const id = formatId(action.payload.id)

      if (state.data.parts[id]) {
        alert('Node with the same id already exists')
        return
      }

      state.data.parts[id] = {
        parentId: state.addNodeParentId,
        assetUrl: '',
        assetPivotX: 0,
        assetPivotY: 0,
        assetSize: 1,
        assetRotation: 0,
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        zIndex: 0
      }

      state.selectedNodeId = id
    },
    editId: (state, action: PayloadAction<string>) => {
      if (!state.data) {
        return
      }

      const newId = formatId(action.payload)

      if (state.editIdType === 'inspector' && state.selectedNodeId) {
        state.data.parts[newId] = state.data.parts[state.selectedNodeId]
        delete state.data.parts[state.selectedNodeId]
        state.selectedNodeId = newId
      }
      if (state.editIdType === 'animator' && state.selectedAnimationId) {
        state.data.animations[newId] = state.data.animations[state.selectedAnimationId]
        delete state.data.animations[state.selectedAnimationId]
        state.selectedAnimationId = newId
      }
    },
    deleteSelectedNode: (state) => {
      if (!state.data || !state.selectedNodeId) {
        return
      }

      delete state.data.parts[state.selectedNodeId]
      state.selectedNodeId = null
    },
    openChangeParentDialog: (state, action: PayloadAction<boolean>) => {
      state.changeParentDialogOpened = action.payload
    },
    changeNodeParent: (state, action: PayloadAction<string | null>) => {
      if (!state.data || !state.selectedNodeId) {
        return
      }

      if (typeof action.payload === 'string' && !state.data.parts[action.payload]) {
        return
      }

      state.data.parts[state.selectedNodeId].parentId = action.payload
    },
    copyNode: (state) => {
      if (!state.data || !state.selectedNodeId) {
        return
      }

      const id = (() => {
        let resultId = (() => {
          const split = state.selectedNodeId.split('-')
          if (split[split.length - 2] === 'copy') {
            return state.selectedNodeId
          }

          return `${formatId(state.selectedNodeId)}-copy-0`
        })()

        while (state.data.parts[resultId]) {
          let idIncrement = String(Number(resultId[resultId.length - 1]) + 1)
          const split = resultId.split('')
          split[split.length - 1] = idIncrement
          resultId = split.join('')
        }

        return resultId
      })()

      state.data.parts[id] = {
        ...state.data.parts[state.selectedNodeId]
      }

      state.selectedNodeId = id
    },
    loadSettingsFromLocalStorage: (state) => {
      const settingsJSON = localStorage.getItem('editor-settings')
      if (!settingsJSON) {
        return
      }

      const settings = JSON.parse(settingsJSON)

      state.debugHitbox = settings.debugHitbox
      state.objectRotation = settings.objectRotation
      state.objectSize = settings.objectSize
      state.debugPivotPoint = settings.debugPivotPoint
      state.showGrid = settings.showGrid
    },
    openEditIdDialog: (state, action: PayloadAction<{ opened: boolean; input?: string; type?: EditIdType }>) => {
      state.editIdDialogOpened = action.payload.opened
      if (action.payload.input) {
        state.editIdInput = action.payload.input
      }
      if (action.payload.type) {
        state.editIdType = action.payload.type
      }
    },
    setEditIdInput: (state, action: PayloadAction<string>) => {
      state.editIdInput = action.payload
    },
    openAssetDialog: (state, action: PayloadAction<boolean>) => {
      state.assetDialogOpened = action.payload
    },
    openLoadDataDialog: (state, action: PayloadAction<boolean>) => {
      state.loadDataDialogOpened = action.payload
    },
    updateKeyframes: (
      state,
      action: PayloadAction<{
        animationId: string
        partId: string
        propertyKey: AnimatableKey
        type: 'keyframes' | 'values'
        value: number
        valueIndex: number
      }>
    ) => {
      const { animationId, partId, propertyKey, type, value, valueIndex } = action.payload
      if (!state.data) {
        return
      }

      if (state.data.animations[animationId].parts[partId].properties[propertyKey]?.[type]) {
        // @ts-ignore
        state.data.animations[animationId].parts[partId].properties[propertyKey][type][valueIndex] = value
      }
    },
    addKeyframes: (
      state,
      action: PayloadAction<{ animationId: string; partId: string; propertyKey: AnimatableKey }>
    ) => {
      const { animationId, partId, propertyKey } = action.payload

      if (!state.data) {
        return
      }

      if (!state.data.animations[animationId].parts[partId]) {
        state.data.animations[animationId].parts[partId] = {
          properties: {}
        }
      }

      if (!state.data.animations[animationId].parts[partId].properties[propertyKey]) {
        state.data.animations[animationId].parts[partId].properties[propertyKey] = {
          keyframes: [],
          values: []
        }
      }

      state.data.animations[animationId].parts[partId].properties[propertyKey]?.keyframes.push(0)
      state.data.animations[animationId].parts[partId].properties[propertyKey]?.values.push(0)
    },
    deleteKeyframes: (
      state,
      action: PayloadAction<{
        animationId: string
        partId: string
        propertyKey: AnimatableKey
        valueIndex: number
      }>
    ) => {
      const { animationId, partId, propertyKey, valueIndex } = action.payload

      if (!state.data || !state.data?.animations[animationId].parts[partId].properties[propertyKey]?.keyframes) {
        return
      }

      // @ts-ignore
      state.data.animations[animationId].parts[partId].properties[propertyKey].keyframes =
        // @ts-ignore
        state.data.animations[animationId].parts[partId].properties[propertyKey].keyframes.filter(
          (_, i) => i !== valueIndex
        )
      // @ts-ignore
      state.data.animations[animationId].parts[partId].properties[propertyKey].values =
        // @ts-ignore
        state.data.animations[animationId].parts[partId].properties[propertyKey].values.filter(
          (_, i) => i !== valueIndex
        )
    },
    sortKeyframes: (
      state,
      action: PayloadAction<{
        animationId: string
        partId: string
        propertyKey: AnimatableKey
      }>
    ) => {
      const { animationId, partId, propertyKey } = action.payload

      if (!state.data) {
        return
      }

      const keyframeValuePairs: { keyframe: number; value: number }[] = state.data.animations[animationId].parts[
        partId
      ].properties[propertyKey]!.keyframes.map((keyframe, index) => ({
        keyframe,
        value: state.data!.animations[animationId].parts[partId].properties[propertyKey]!.values[index]
      }))

      keyframeValuePairs.sort((a, b) => a.keyframe - b.keyframe)

      state.data.animations[animationId].parts[partId].properties[propertyKey]!.keyframes = keyframeValuePairs.map(
        (pair) => pair.keyframe
      )
      state.data.animations[animationId].parts[partId].properties[propertyKey]!.values = keyframeValuePairs.map(
        (pair) => pair.value
      )
    },
    createAnimation: (state) => {
      if (!state.data) {
        return
      }

      const animationId = uuidv4()
      state.data.animations[animationId] = {
        duration: 1000,
        repeat: false,
        parts: {}
      }
    },
    setCurrentAnimation: (state, action: PayloadAction<AnimationRenderObj | null>) => {
      state.currentAnimation = action.payload
    },
    setAnimationRepeat: (state, action: PayloadAction<{ animationId: string; value: boolean }>) => {
      if (!state.data) {
        return
      }

      const { animationId, value } = action.payload

      state.data.animations[animationId].repeat = value
    },
    setAnimationDuration: (state, action: PayloadAction<{ animationId: string; value: number }>) => {
      if (!state.data) {
        return
      }

      const { animationId, value } = action.payload

      state.data.animations[animationId].duration = value
    },
    setSelectedAnimationId: (state, action: PayloadAction<string | null>) => {
      state.selectedAnimationId = action.payload
    },
    deleteSelectedAnimation: (state) => {
      if (!state.data || !state.selectedAnimationId) {
        return
      }

      delete state.data.animations[state.selectedAnimationId]
      state.selectedAnimationId = null
    }
  }
})

export const {
  selectNode,
  updateNode,
  updateNodeProperty,
  clearNodeProperty,
  setNodeAsset,
  setAssets,
  loadData,
  setDebugHitbox,
  setDebugPivotPoint,
  setObjectRotation,
  setObjectSize,
  setShowGrid,
  setAddNodeDialogOpened,
  setAddNodeParentId,
  addNewNode,
  editId,
  deleteSelectedNode,
  openChangeParentDialog,
  changeNodeParent,
  copyNode,
  loadSettingsFromLocalStorage,
  openEditIdDialog,
  setEditIdInput,
  openAssetDialog,
  updateKeyframes,
  addKeyframes,
  deleteKeyframes,
  sortKeyframes,
  createAnimation,
  setCurrentAnimation,
  setAnimationRepeat,
  setAnimationDuration,
  setSelectedAnimationId,
  deleteSelectedAnimation,
  openLoadDataDialog
} = animatorSlice.actions
export default animatorSlice.reducer
