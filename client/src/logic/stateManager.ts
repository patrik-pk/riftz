import { IGameObjectSerialized, IUpdate } from 'riftz-shared'

class GameStateManager {
  renderDelay: number = 50
  updates: IUpdate[] = []
  latency: number = 0

  constructor() {}

  processUpdate = (update: IUpdate, latency: number) => {
    this.latency = latency
    this.updates.push(update)
    this.removeOldUpdates()
  }

  getLatestUpdate(): IUpdate {
    if (!this.updates.length) {
      return this.getEmptyUpdate()
    }

    return this.updates[this.updates.length - 1]
  }

  getCurrentUpdate = (): IUpdate => {
    if (!this.updates.length) {
      return this.getEmptyUpdate()
    }

    const baseUpdateIndex = this.getBaseUpdateIndex()

    // if base update is the last update, then theres no next update to interpolate with, so return it
    if (baseUpdateIndex < 0 || baseUpdateIndex === this.updates.length - 1) {
      return this.updates[this.updates.length - 1]
    }

    const baseUpdate = this.updates[baseUpdateIndex]
    const nextUpdate = this.updates[baseUpdateIndex + 1]

    const currentRenderTimestamp = this.getCurrentRenderTimestamp()
    const timeDiffBetweenUpdates = nextUpdate.timestamp - baseUpdate.timestamp
    const timeElapsedFromBase = currentRenderTimestamp - baseUpdate.timestamp
    const ratio = timeElapsedFromBase / timeDiffBetweenUpdates

    if (nextUpdate.me.disableInterpolation) {
      return nextUpdate
    }

    return {
      ...nextUpdate,
      camera: {
        x: this.interpolateValue(baseUpdate.camera.x, nextUpdate.camera.x, ratio),
        y: this.interpolateValue(baseUpdate.camera.y, nextUpdate.camera.y, ratio)
      },
      gameObjects: nextUpdate.gameObjects.map((nextUpdateGO) =>
        this.interpolateGameObject(
          baseUpdate.gameObjects.find((baseUpdateGO) => baseUpdateGO.id === nextUpdateGO.id),
          nextUpdateGO,
          ratio
        )
      )
    }
  }

  getCurrentRenderTimestamp() {
    return Date.now() - this.renderDelay - this.latency
  }

  removeOldUpdates() {
    const baseUpdateIndex = this.getBaseUpdateIndex()
    if (baseUpdateIndex > 0) {
      this.updates.splice(0, baseUpdateIndex)
    }
  }

  // Reverse loop trough updates and return the first update index
  // that is timewise equal or behind the server time
  getBaseUpdateIndex() {
    const currentRenderTimestamp = this.getCurrentRenderTimestamp()

    for (let i = this.updates.length - 1; i >= 0; i--) {
      if (this.updates[i].timestamp <= currentRenderTimestamp) {
        return i
      }
    }
    return -1
  }

  interpolateValue(baseValue: number, nextValue: number, ratio: number) {
    const diff = nextValue - baseValue
    return baseValue + diff * ratio
  }

  // Determines the best way to rotate (cw or ccw) when interpolating a direction.
  // For example, when rotating from -3 radians to +3 radians, we should really rotate from
  // -3 radians to +3 - 2pi radians.
  interpolateDirection(baseDirection: number, nextDirection: number, ratio: number) {
    const diff = Math.abs(nextDirection - baseDirection)
    if (diff >= Math.PI) {
      // The angle between the directions is large - we should rotate the other way
      if (baseDirection > nextDirection) {
        return baseDirection + (nextDirection + 2 * Math.PI - baseDirection) * ratio
      }
      return baseDirection - (nextDirection - 2 * Math.PI - baseDirection) * ratio
    }

    // Normal interpolation
    return baseDirection + (nextDirection - baseDirection) * ratio
  }

  interpolateGameObject(
    baseObj: IGameObjectSerialized | undefined,
    nextObj: IGameObjectSerialized,
    ratio: number
  ): IGameObjectSerialized {
    if (!baseObj) {
      return nextObj
    }

    const interpolatedX = this.interpolateValue(baseObj.position.x, nextObj.position.x, ratio)
    const interpolatedY = this.interpolateValue(baseObj.position.y, nextObj.position.y, ratio)
    const interpolatedDirection = this.interpolateDirection(baseObj.direction, nextObj.direction, ratio)

    return {
      ...nextObj,
      position: {
        x: interpolatedX,
        y: interpolatedY
      },
      direction: interpolatedDirection
    }
  }

  getEmptyUpdate(): IUpdate {
    return {
      timestamp: 0,
      camera: {
        x: 0,
        y: 0
      },
      me: {
        id: '',
        size: 0,
        healthPoints: 0,
        attackPower: 0,
        attackSpeed: 0,
        cooldownReduction: 0,
        weight: 0,
        movementSpeed: 0,
        disableInterpolation: false
      },
      gameObjects: [],
      hits: [],
      messages: []
    }
  }
}

const gameStateManager = new GameStateManager()

export default gameStateManager
