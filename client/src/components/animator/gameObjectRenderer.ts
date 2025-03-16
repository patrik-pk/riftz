import store from '@/redux/store'
import PlayerDaggers from '@/data/gameObjects/player-daggers.json'
import PlayerBase from '@/data/gameObjects/player-base.json'
import PlayerShield from '@/data/gameObjects/player-shield.json'
import TestMob from '@/data/gameObjects/test-mob.json'
import TestArmor from '@/data/additionalParts/test-armor.json'
import TestWings from '@/data/additionalParts/test-wings.json'
import TestAccessory from '@/data/additionalParts/test-accessory.json'
import { assetManager } from '@/logic/assetManager'
import { drawSvg } from '@/logic/draw/renderUtils'

export const allGameObjectData: Record<string, IDefinedObject> = {
  'player-base': PlayerBase,
  'player-daggers': PlayerDaggers,
  'player-shield': PlayerShield,
  'test-mob': TestMob
}

export const allAdditionalParts: Record<string, IAdditionalPart> = {
  armor: TestArmor,
  wings: TestWings,
  accessory: TestAccessory
}

export type IAdditionalPart = IDefinedObjectPart & { partId: string }

export type IDefinedObject = {
  name: string
  parts: Record<string, IDefinedObjectPart> // string represents part id, it is the same value as id property, same with animations
  animations: Record<string, IAnimation>
}

// TODO: add support for svg rendering
export interface IDefinedObjectPart {
  parentId: string | null
  assetUrl?: string
  svgPath?: string
  assetPivotX: number
  assetPivotY: number
  assetSize: number
  assetRotation: number
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  rotation: number
  zIndex: number
}

export interface IAnimation {
  duration: number
  repeat: boolean
  parts: Record<string, IAnimationPart> // key = partId
}

export type AnimatableKey = keyof Pick<
  IDefinedObjectPart,
  'translateX' | 'translateY' | 'rotation' | 'scaleX' | 'scaleY'
>

export const animatableKeys: AnimatableKey[] = ['translateX', 'translateY', 'rotation', 'scaleX', 'scaleY']

export interface IAnimationPart {
  properties: Partial<Record<AnimatableKey, Keyframes>>
}

export type Keyframes = {
  keyframes: number[]
  values: number[]
}

export interface IDefinedTreeObject {
  parts: IDefinedObjectTreePart[]
  animations: IDefinedObject['animations']
}

export interface IDefinedObjectTreePart extends IDefinedObjectPart {
  id: string
  children: IDefinedObjectTreePart[]
}

interface CalculatedPart {
  id: string
  steps: Step[]
  assetUrl?: string
  svgPath?: string
  assetPivotX: number
  assetPivotY: number
  assetSizeMultiplier: number
  assetRotation: number
  zIndex: number
  children: CalculatedPart[]
}

interface Step {
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  rotation: number
}

export interface AnimationRenderObj {
  uniqueId?: string
  id: string
  duration: number
  createdAt: number
  repeat?: boolean
}

export class GameObjectRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas
    this.ctx = ctx
  }

  calculateAnimationProgress(createdAt: number, duration: number, repeat?: boolean): number {
    const timeElapsed = Date.now() - createdAt
    let progress = timeElapsed / duration
    if (progress > 1 && repeat) progress = progress % 1
    progress = Math.min(progress, 1)
    return progress
  }

  async renderGameObject(params: {
    data: IDefinedObject
    size: number
    rotation?: number
    animation?: AnimationRenderObj | null
    type?: 'animator' | 'game' | 'other'
    testProperties?: IAdditionalPart[]
    waitForAssetsToDownload?: boolean
  }) {
    const { data, size, rotation = 0, animation, type = 'other', testProperties, waitForAssetsToDownload } = params

    const copiedData = JSON.parse(JSON.stringify(data)) as IDefinedObject // remove this for performance

    // armor = part object that gets appended to "parts" if part with provided parentId
    // is present (or if it has no parentId)
    testProperties?.forEach((property) => {
      if (property.parentId === null || copiedData.parts[property.parentId]) {
        copiedData.parts[property.partId] = property
      }
    })

    const animationData = animation ? copiedData.animations[animation.id] : null
    const animationProgress = animation
      ? this.calculateAnimationProgress(animation.createdAt, animation.duration, animation.repeat)
      : 0

    // construct tree - this step can be optimized to happen only on load (data can hold both plain and tree structure of the object)
    const dataTree = GameObjectRenderer.constructTreeFromObject(copiedData)

    // loop tree and create temporary copy with calculated values
    const copy: CalculatedPart[] = []

    const recursive = (whereToPush: CalculatedPart[], item: IDefinedObjectTreePart, prevSteps: Step[] = []) => {
      let translateX = item.translateX
      const translateY = item.translateY
      const scaleX = item.scaleX
      const scaleY = item.scaleY
      const rotation = item.rotation
      const assetUrl = item.assetUrl
      const svgPath = item.svgPath
      const assetPivotX = item.assetPivotX
      const assetPivotY = item.assetPivotY
      const assetSize = item.assetSize

      const currentStep: Step = {
        translateX,
        translateY,
        rotation,
        scaleX,
        scaleY
      }

      if (animationData && animationData.parts[item.id]) {
        Object.entries(animationData.parts[item.id].properties).forEach(([propKey, keyframes]) => {
          if (!keyframes.keyframes.length) {
            return
          }

          const propertyKey = propKey as AnimatableKey

          const keyframesKeys = keyframes.keyframes
          let keyFromIndex: number | null = null
          let keyToIndex: number | null = 0

          keyframesKeys.forEach((k, i) => {
            if (animationProgress >= k) {
              keyFromIndex = i
              if (keyframesKeys[i + 1]) {
                keyToIndex = i + 1
              } else {
                keyToIndex = null
              }
            }
          })

          const keyFrom = typeof keyFromIndex === 'number' ? keyframes.keyframes[keyFromIndex] : 0
          const keyTo = typeof keyToIndex === 'number' ? keyframes.keyframes[keyToIndex] : 1
          const valueFrom = typeof keyFromIndex === 'number' ? keyframes.values[keyFromIndex] : 0
          const valueTo = typeof keyToIndex === 'number' ? keyframes.values[keyToIndex] : 0

          const keyDiff = keyTo - keyFrom
          const progressBetweenKeys = (animationProgress - keyFrom) / keyDiff

          const valueDiff = valueFrom + (valueTo - valueFrom) * progressBetweenKeys

          currentStep[propertyKey] += valueDiff // calculated result
        })
      }

      const steps: Step[] = [...prevSteps, currentStep]

      const newItem: CalculatedPart = {
        id: item.id,
        steps,
        assetUrl,
        svgPath,
        assetPivotX,
        assetPivotY,
        assetRotation: item.assetRotation,
        assetSizeMultiplier: assetSize,
        zIndex: item.zIndex,
        children: []
      }

      whereToPush.push(newItem)

      item.children.forEach((child) => {
        recursive(newItem.children, child, steps)
      })
    }

    dataTree.parts.forEach((item) => {
      recursive(copy, item)
    })

    // flatten tree into array and sort by z-index
    const flattenTree = (tree: CalculatedPart[]): CalculatedPart[] => {
      const flattened: CalculatedPart[] = []

      const recursive = (item: CalculatedPart) => {
        flattened.push(item)

        item.children.forEach((child) => {
          recursive(child)
        })
      }

      tree.forEach((item) => {
        recursive(item)
      })

      return flattened
    }

    const flattened = flattenTree(copy)
    const sorted = flattened.sort((a, b) => a.zIndex - b.zIndex)

    this.ctx.save()
    this.ctx.rotate(rotation)

    if (waitForAssetsToDownload) {
      const downloadPromises = sorted.filter(part => part.assetUrl).map(part => assetManager.downloadAsset(part.assetUrl as string, part.assetUrl as string, true))
      await Promise.all(downloadPromises)
    }

    sorted.forEach((part) => {
      const makeTransparent = (() => {
        if (type !== 'animator') {
          return false
        }

        const selectedNodeId = store.getState().animator.selectedNodeId
        return typeof selectedNodeId === 'string' && part.id !== selectedNodeId
      })()

      this.renderAsset(part, size, makeTransparent)
    })

    const debugHitbox = store.getState().animator.debugHitbox
    if (debugHitbox) {
      this.debugHitbox(size)
    }

    this.ctx.restore()
  }

  // TODO: continue here? if/else draw svg
  private async renderAsset(data: CalculatedPart, size: number, makeTransparent?: boolean) {
    // FIX: smth about translate/rotate is wrong here, UI works fine
    const { steps, assetUrl, svgPath } = data

    if (assetUrl) {
      await assetManager.downloadAsset(assetUrl, assetUrl, true)
    }

    const asset = assetManager.assets[assetUrl ?? '']?.imgElement
    if (assetUrl && !asset) {
      return
    }

    this.ctx.save()

    steps.forEach((step) => {
      this.ctx.scale(step.scaleX, step.scaleY)
      this.ctx.translate(step.translateX * size, step.translateY * size)
      this.ctx.rotate(step.rotation)
    })

    this.ctx.save()
    this.ctx.rotate(data.assetRotation)
    if (makeTransparent) {
      this.ctx.globalAlpha = 0.3
    }

    if (assetUrl) {
      this.renderImg(data, size, asset)
    }
    if (svgPath) {
      this.renderSvg(data, size)
    }

    this.ctx.restore()

    const debugPivotPoint = store.getState().animator.debugPivotPoint
    if (debugPivotPoint) {
      this.debugPivotPoint()
    }

    this.ctx.restore()
  }

  private renderImg(data: CalculatedPart, size: number, asset: HTMLImageElement) {
    const { assetSizeMultiplier, assetPivotX, assetPivotY } = data

    const assetSize = size * 2 * assetSizeMultiplier
    const assetHeightWidthRatio = asset.height / asset.width

    const assetWidth = assetSize
    const assetHeight = assetSize * assetHeightWidthRatio

    let assetPositionX = -assetWidth / 2
    let assetPositionY = -assetHeight / 2

    assetPositionX += assetWidth * assetPivotX
    assetPositionY += assetHeight * assetPivotY

    this.ctx.drawImage(asset, assetPositionX, assetPositionY, assetWidth, assetHeight)
  }

  private renderSvg(data: CalculatedPart, size: number) {
    const { svgPath } = data
    if (!svgPath) {
      return
    }

    drawSvg({
      ctx: this.ctx,
      svgPath,
      scale: { x: size, y: size },
      fillStyle: 'rgb(0, 255, 0, 0.3)'
      // TODO: fillStyle
      // TODO: stroke/default stroke
    })
  }

  private debugPivotPoint() {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.fillStyle = 'red'
    this.ctx.arc(0, 0, 3, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.closePath()
    this.ctx.restore()
  }

  private debugHitbox(size: number) {
    this.ctx.save()
    this.ctx.globalAlpha = 0.1
    this.ctx.fillStyle = 'red'
    this.ctx.arc(0, 0, size, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.restore()
  }

  static constructTreeFromObject(data: IDefinedObject): IDefinedTreeObject {
    const buildTree = (items: [string, IDefinedObjectPart][], parentId: string | null): IDefinedObjectTreePart[] => {
      const result: IDefinedObjectTreePart[] = []

      for (const entry of items) {
        const [itemId, item] = entry

        if (item.parentId === parentId) {
          const children = buildTree(items, itemId)
          const treeItem: IDefinedObjectTreePart = {
            ...item,
            id: itemId,
            children
          }
          result.push(treeItem)
        }
      }

      return result
    }

    return {
      parts: buildTree(Object.entries(data.parts), null),
      animations: data.animations
    }
  }
}
