import { getProgress, smoothen } from '../../utils/utils'
import gameStateManager from '../stateManager'
import store from '@/redux/store'
import {
  GameObjectRenderer,
  IAdditionalPart,
  allAdditionalParts,
  allGameObjectData
} from '@/components/animator/gameObjectRenderer'
import {
  IAnimation,
  IGameObjectSerialized,
  IHitObject,
  IMobSerialized,
  IPlayerSerialized,
  ITimeoutEffect,
  IUpdateMe,
  IVector2
} from 'riftz-shared'
import { ICircleCollisionObject } from '@/types/utils'
import { assetManager } from '@/logic/assetManager'

const OLD_HP_STACK_DURATION = 200

interface ISize {
  width: number
  height: number
}

type TextOptions = {
  fontSize?: number
  color?: string
  outline?: boolean
  textAlign?: CanvasTextAlign
  textBaseLine?: CanvasTextBaseline
  opacity?: number
}

const hpBarSettings = {
  barWidth: 150,
  barHeight: 12,
  bgOutline: 6,
  smallHpFraction: 100,
  bigHpFraction: 1000
}

class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  currentRenderCount: number = 0
  currentDebugCount: number = 0
  lastRenderTimestamp: number = 0
  gameObjectRenderer: GameObjectRenderer

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas
    this.ctx = ctx
    this.gameObjectRenderer = new GameObjectRenderer(this.canvas, this.ctx)
  }

  render() {
    if (!this.canvas || !this.ctx) return

    const { mapSize } = store.getState().update
    this.currentRenderCount += 1

    const currentUpdate = gameStateManager.getCurrentUpdate()

    if (!currentUpdate) return

    const { camera, hits, gameObjects, me } = currentUpdate

    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.moveCamera(camera)
    this.renderMap(mapSize)
    // this.renderPVPZones(pvpZones)
    // this.renderGroundPattern(me, mapSize)
    this.renderGameObjects(gameObjects, me)

    const debugAttackHits = false
    if (debugAttackHits) {
      this.debugAttackHits(hits)
    }

    const oldRenderTimestamp = this.lastRenderTimestamp
    this.lastRenderTimestamp = Date.now()
    const renderTimestampDiff = this.lastRenderTimestamp - oldRenderTimestamp
    if (renderTimestampDiff < 16 || renderTimestampDiff > 17) {
      // this.debug(renderTimestampDiff, 1)
    }
  }

  renderGameObjects(gameObjects: IGameObjectSerialized[], me: IUpdateMe) {
    // const allGameObjects = store.getState().gameData.renderableGameObjects

    gameObjects.forEach((obj) => {
      const isMe = obj.id === me.id

      const gameObjectData = allGameObjectData[obj.renderGameObjectId]
      if (!gameObjectData) {
        return
      }

      this.ctx.save()

      this.ctx.translate(obj.position.x, obj.position.y)
      this.ctx.rotate(Math.PI / 2)

      const anim = obj.animation ? { ...obj.animation, id: obj.animation.name } : null // refactor

      const goProperties = ((): IAdditionalPart[] => {
        const result: IAdditionalPart[] = []

        if (obj.goCategory === 'player') {
          const renderParts = (obj as IPlayerSerialized).renderParts
          Object.values(renderParts).forEach((part) => {
            if (!part || !allAdditionalParts[part]) {
              return
            }

            result.push(allAdditionalParts[part])
          })
        }

        return result
      })()

      this.gameObjectRenderer.renderGameObject({
        data: gameObjectData,
        size: obj.size,
        rotation: obj.direction,
        animation: anim,
        type: 'game',
        testProperties: goProperties
      })

      this.ctx.restore()
    })

    gameObjects.forEach((obj) => {
      if (obj.goCategory !== 'projectile') {
        this.renderGameObjectUI(obj, me)
      }
    })
  }

  debug(value: unknown, renderAmount: number, maxAmount?: number) {
    if (this.currentRenderCount % renderAmount !== 0) {
      return
    }

    if (typeof maxAmount === 'number' && this.currentDebugCount >= maxAmount) {
      return
    }

    this.currentDebugCount += 1
    console.log(value)
  }

  debugAttackHits(hits: IHitObject[]) {
    hits.forEach((hit) => {
      this.renderCircle(hit.position, hit.size)
    })
  }

  renderGameObjectUI(obj: IGameObjectSerialized, me: IUpdateMe) {
    this.renderGoHpBar(obj, me)
    this.renderGoFloatingInfo(obj)
    this.renderGoDebugInfo(obj)
    if (obj.goCategory === 'player' || obj.goCategory === 'mob') {
      this.renderEntityEffects(obj as IPlayerSerialized | IMobSerialized)
    }
    if (obj.goCategory === 'player') {
      this.renderCastBar(obj as IPlayerSerialized)
    }
  }

  renderCastBar(obj: IPlayerSerialized) {
    if (!obj.actionTrigger || !obj.actionTrigger.renderBar) {
      return
    }

    const progress = getProgress(
      obj.actionTrigger.createdTimestamp,
      obj.actionTrigger.triggerTimestamp - obj.actionTrigger.createdTimestamp - 200
    )

    const yOffset = obj.size * 2.5
    const barWidth = 200
    const barHeight = 10

    this.ctx.save()
    this.ctx.translate(obj.position.x, obj.position.y + yOffset)

    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(-barWidth / 2, 0, barWidth * progress, barHeight)

    this.ctx.restore()
  }

  renderEntityEffects(obj: IPlayerSerialized | IMobSerialized) {
    if (!obj.isAlive) {
      return
    }

    const effect = ((): ITimeoutEffect | undefined => {
      if (obj.effects.currentSlowId) {
        return obj.effects.slows[obj.effects.currentSlowId]
      }
      if (obj.effects.currentStunId) {
        return obj.effects.stuns[obj.effects.currentStunId]
      }
    })()

    if (!effect) {
      return
    }

    const progress = getProgress(effect.createdAt, effect.duration, true)

    const yOffset = -100
    this.ctx.save()
    this.ctx.translate(obj.position.x, obj.position.y + yOffset)

    this.renderText({ x: 0, y: 0 }, effect.displayedText.toUpperCase(), {
      textAlign: 'center'
    })

    const effectBarWidth = 100
    const effectBarHeight = 2
    const effectBarYOffset = 15

    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(-effectBarWidth / 2, effectBarYOffset, effectBarWidth * progress, effectBarHeight)

    this.ctx.restore()
  }

  renderGoDebugInfo(obj: IGameObjectSerialized) {
    if (!obj.debugInfo) {
      return
    }

    const debugKeys = Object.keys(obj.debugInfo)
    const yOffset = 0
    let yIncrease = 0

    debugKeys.forEach((key) => {
      this.ctx.save()
      this.ctx.translate(obj.position.x, obj.position.y + yOffset + yIncrease)

      const info = obj.debugInfo[key]
      this.renderText({ x: 0, y: 0 }, `${key}: ${info}`, {
        textAlign: 'center'
      })
      yIncrease -= 20

      this.ctx.restore()
    })
  }

  renderGoHpBar(obj: IGameObjectSerialized, me: IUpdateMe) {
    const { position, size, currentHealth, healthPoints, oldHealth, healthChangedTimestamp, isAlive } = obj
    const { x, y } = position

    if (!isAlive) {
      return
    }

    const { barWidth, barHeight, bgOutline } = hpBarSettings
    const drawLines = true
    const currentColor = this.getBarColor(obj, me)

    let hpFraction = currentHealth / healthPoints
    if (hpFraction > 1) hpFraction = 1
    if (hpFraction < 0) hpFraction = 0

    const oldHpFraction = this.getOldHpFraction(currentHealth, healthPoints, oldHealth, healthChangedTimestamp)
    const barWidthStart = barWidth / -2
    const barHeightStart = barHeight / -2

    this.ctx.save()
    this.ctx.translate(x, y)
    this.ctx.translate(0, size * 1.9)

    // HP Background
    this.renderRoundedRect(
      (barWidth + bgOutline) / -2,
      (barHeight + bgOutline) / -2,
      barWidth + bgOutline,
      barHeight + bgOutline,
      8,
      'black'
    )

    // Old HP Bar
    this.renderRoundedRect(barWidthStart, barHeightStart, barWidth * oldHpFraction, barHeight, 6, 'yellow')

    // Current HP Bar
    this.renderRoundedRect(barWidthStart, barHeightStart, barWidth * hpFraction, barHeight, 6, currentColor || 'green')

    if (drawLines) {
      this.renderBarLines(currentHealth, healthPoints)
    }

    // Draw current HP text
    this.renderText({ x: 0, y: 0 }, String(Math.floor(currentHealth)), {
      textAlign: 'center',
      fontSize: 12,
      outline: false
    })

    // Draw nick
    const textHeightOffset = 12
    let name = obj.displayedName.substring(0, 14)
    if (obj.goCategory === 'player') {
      name += ` (${(obj as IPlayerSerialized).level.currentLevel})`
    }
    if (obj.goCategory === 'mob') {
      name += ` (${(obj as IMobSerialized).level})`
    }

    this.renderText({ x: barWidthStart, y: barHeightStart - textHeightOffset }, name, {
      fontSize: 12
    })

    this.ctx.restore()
  }

  getBarColor(obj: IGameObjectSerialized, me: IUpdateMe) {
    // is friendly
    if (obj.id === me.id) {
      return '#55a630'
      // return '#2b9348'
    }

    // resource
    // if (obj.objType == 'resource') {
    //   return 'yellow'
    // }

    return '#d00000'
  }

  getOldHpFraction(
    currentHealth: number,
    maxHp: number,
    oldHealth: number | null,
    healthChangedTimestamp: number | null
  ) {
    let result = 0

    if (!healthChangedTimestamp || !oldHealth) {
      return result
    }

    const oldHpAnimationDuration = 300
    const timeElapsed = Date.now() - healthChangedTimestamp // need current server time?

    if (timeElapsed > oldHpAnimationDuration + OLD_HP_STACK_DURATION) {
      // if (timeElapsed > oldHpAnimationDuration) {
      return result
    }

    let oldHpProgress = 1 - (timeElapsed - OLD_HP_STACK_DURATION) / oldHpAnimationDuration
    // 1 - timeElapsed / oldHpAnimationDuration
    if (oldHpProgress > 1) oldHpProgress = 1
    if (oldHpProgress < 0) oldHpProgress = 0

    const oldHpDiff = (oldHealth || currentHealth) - currentHealth
    const oldHpToShow = oldHpDiff * oldHpProgress

    result = (currentHealth + oldHpToShow) / maxHp
    if (result > 1) result = 1
    if (result < 0) result = 0

    return result
  }

  renderRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    borderRadius: number,
    fillColor: string = 'black'
  ) {
    if (width <= 0 || height <= 0) {
      return
    }

    this.ctx.beginPath()
    this.ctx.fillStyle = fillColor
    this.ctx.moveTo(x + borderRadius, y)
    this.ctx.arcTo(x + width, y, x + width, y + height, borderRadius)
    this.ctx.arcTo(x + width, y + height, x, y + height, borderRadius)
    this.ctx.arcTo(x, y + height, x, y, borderRadius)
    this.ctx.arcTo(x, y, x + width, y, borderRadius)
    this.ctx.fill()
    this.ctx.closePath()
  }

  renderBarLines(currentHealth: number, maxHp: number) {
    const { smallHpFraction, bigHpFraction, barWidth, barHeight } = hpBarSettings

    const smallLineCount = currentHealth / smallHpFraction
    const bigLineCount = currentHealth / bigHpFraction

    this.ctx.save()
    this.ctx.translate(-barWidth / 2, -barHeight / 2)
    this.ctx.strokeStyle = 'black'
    this.ctx.lineWidth = 1

    // Draw small lines
    for (let i = 1; i < smallLineCount; i++) {
      let lineX = smallHpFraction * i
      lineX = (lineX / maxHp) * barWidth

      this.ctx.beginPath()
      this.ctx.moveTo(lineX, 0)
      this.ctx.lineTo(lineX, barHeight / 3)
      this.ctx.stroke()
    }

    this.ctx.lineWidth = 2

    // Draw big lines
    for (let i = 1; i < bigLineCount; i++) {
      let lineX = bigHpFraction * i
      lineX = (lineX / maxHp) * barWidth

      this.ctx.beginPath()
      this.ctx.moveTo(lineX, 0)
      this.ctx.lineTo(lineX, barHeight)
      this.ctx.stroke()
    }

    this.ctx.closePath()
    this.ctx.restore()
  }

  moveCamera(position: IVector2) {
    this.ctx.translate(-position.x + this.canvas.width / 2, -position.y + this.canvas.height / 2)
  }

  renderMap(mapSize: number) {
    const edgeSize = 10000

    // Render edges
    this.ctx.fillStyle = '#1c3320'
    this.ctx.fillRect(-edgeSize, -edgeSize, mapSize + edgeSize * 2, mapSize + edgeSize * 2)

    // Render center
    this.ctx.fillStyle = '#2c5134'
    this.ctx.fillRect(0, 0, mapSize, mapSize)
  }

  renderPVPZones(zones: ICircleCollisionObject[]) {
    zones.forEach((zone) => {
      this.renderCircle(zone.position, zone.size, '#27482e')
    })
  }

  async renderGroundPattern(camera: IVector2, mapSize: number) {
    await assetManager.downloadAsset('ground-pattern', 'assets/world/pattern.png')

    const img = assetManager.assets['ground-pattern'].imgElement

    if (!img || !mapSize || !camera) {
      return
    }

    const patternSize = 1000

    const patternWidth = patternSize
    const patternHeight =
      // @ts-ignore
      ((img.height as number) / (img.width as number)) * patternSize

    const baseIndexX = Math.floor(camera.x / patternWidth)
    const baseIndexY = Math.floor(camera.y / patternHeight)

    const tileOffset = 1
    // 1 = 3 x 3
    // 1 1 1
    // 1 P 1
    // 1 1 1

    for (let i = -tileOffset; i <= tileOffset; i++) {
      const indexX = baseIndexX + i

      for (let j = -tileOffset; j <= tileOffset; j++) {
        const indexY = baseIndexY + j

        this.ctx.beginPath()
        this.ctx.drawImage(img, indexX * patternWidth, indexY * patternHeight, patternWidth, patternHeight)
        this.ctx.closePath()
      }
    }
  }

  renderGoFloatingInfo(obj: IGameObjectSerialized) {
    if (!obj.floatingInfo) {
      return
    }

    Object.keys(obj.floatingInfo).forEach((key) => {
      const info = obj.floatingInfo[key]
      let value = typeof info.value === 'number' ? Math.floor(info.value) : info.value
      value = String(value)

      const color = (() => {
        if (info.type === 'damage') {
          return '#d00000'
        } else if (info.type === 'heal') {
          return '#55a630'
        }

        return 'white'
      })()

      let progress = getProgress(info.createdAt, 1000)
      progress = smoothen(progress)

      const offsetX = progress * 1 * obj.size
      const offsetY = progress * -100

      let textX = obj.position.x + offsetX
      let textY = obj.position.y - obj.size * 1.5 + offsetY

      const opacity = 1 - progress
      const fontSize = 20 + progress * 20

      this.renderText({ x: textX, y: textY }, value, {
        color,
        fontSize: fontSize,
        opacity
      })
    })
  }

  renderText(position: IVector2, value: string, options: TextOptions) {
    const {
      fontSize = 12,
      color = 'white',
      outline = true,
      textAlign = 'left',
      textBaseLine = 'middle',
      opacity = 1
    } = options

    this.ctx.save()

    this.ctx.globalAlpha = opacity
    this.ctx.font = `bold ${fontSize}px Montserrat`
    this.ctx.fillStyle = color
    this.ctx.textBaseline = textBaseLine
    this.ctx.textAlign = textAlign

    if (outline) {
      this.ctx.shadowColor = 'black'
      this.ctx.shadowBlur = 0
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 0
      this.ctx.lineWidth = 7
      this.ctx.lineJoin = 'round'
      this.ctx.strokeText(value, position.x, position.y)
    }

    this.ctx.fillText(value, position.x, position.y)

    this.ctx.restore()
  }

  renderCircle(
    position: IVector2,
    size: number,
    fillColor: string = 'rgb(255, 0, 0, 0.3)',
    strokeColor: string = 'black',
    strokeWidth?: number
  ) {
    this.ctx.save()
    this.ctx.translate(position.x, position.y)
    this.ctx.beginPath()
    this.ctx.fillStyle = fillColor
    this.ctx.arc(0, 0, size, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.strokeStyle = strokeColor
    if (strokeWidth) {
      this.ctx.lineWidth = strokeWidth
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()
  }

  isAliveWithoutDeathAnimation(isAlive: boolean, animation: IAnimation | null) {
    if (!isAlive) {
      if (!animation?.name.includes('death')) {
        return false
      }

      const isFinished = Date.now() - animation.duration > animation.createdAt

      if (isFinished) {
        return false
      }
    }

    return true
  }

  // Get correct pivot point of image.
  // First divide by minus 2 to make pivot the center of the image,
  // then adjust the pivot with multipliers that each image have.
  // If values are missing, return 0
  getBasePosition(size: ISize, adjustPivotMultipliers?: IVector2): IVector2 {
    const { width, height } = size

    // Set pivot to center
    let x = width ? width / -2 : 0
    let y = height ? height / -2 : 0

    // Adjust pivot
    x += width * (adjustPivotMultipliers?.x || 0)
    y += height * (adjustPivotMultipliers?.y || 0)

    return { x, y }
  }

  getImageWidthAndHeight(size: number, imgSizeMultiplier: number, HWRatio: number): ISize {
    // ISize is radius, so multiply by 2 to get diameter
    const imgSize = size * 2

    // Width is simply diameter multiplied by size multiplier
    // which is just a value to adjust the image to fit-in correctly
    const width = imgSize * imgSizeMultiplier

    // Height then can be calculated easily by multiplying
    // width with height/width ratio of the image
    const height = width * HWRatio

    return {
      width,
      height
    }
  }

  getHeightWidthRatio(img: CanvasImageSource | undefined): number {
    if (!img) {
      return 0
    }

    // @ts-ignore
    return img ? (img.height as number) / (img.width as number) : 0
  }
}

export default Renderer
