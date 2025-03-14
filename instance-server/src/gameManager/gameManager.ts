import { v4 as uuidv4 } from 'uuid'
import { Socket } from 'socket.io'
import Player from '../player/player'
import Mob from '../mob/mob'
import Projectile from '../projectile/projectile'
import Vector2 from '../utils/vector2'
import GameObject from '../gameObject/gameObject'
import { getRandomObjectKey, randomBetween } from '../utils/utils'
import { IPrepareUserForConnectionBody, allMobData } from 'riftz-shared'
import {
  ClientToInstanceServerEvents,
  IHitObject,
  IServerInfo,
  IUpdate,
  InstanceServerToClientEvents,
} from 'riftz-shared'
const Loop = require('accurate-game-loop')

export type ISetTrigger = (callback: Function, tickAmount: number) => void

export type PlayerSocket = Socket<ClientToInstanceServerEvents, InstanceServerToClientEvents>

class GameManager {
  sockets: Record<string, PlayerSocket> = {}
  connectingPlayers: Record<string, Player> = {}
  players: Record<string, Player> = {} // id = socket id
  mobs: Record<string, Mob> = {} // id = uuidv4
  projectiles: Record<string, Projectile> = {}
  hits: IHitObject[] = [] // only to debug
  mapSize: number = 2000
  maxMobCount: number = 3

  tickRate: number = 30
  realtimeTickRate: number = 0
  loopInterval: number
  resetLoopInterval: number
  startTimestamp: number = new Date().getTime()
  currentLoopTimestamp: number = 0
  lastUpdateTimestamp: number = 0

  currentTick: number = 0

  constructor() {
    this.loopInterval = 1000 / this.tickRate
    this.resetLoopInterval = this.loopInterval * 3

    // This library solution is extremely CPU expensive. New idea is to make a loop with setTimeout that catches up.
    // If the timer fires 3ms late, then set next timeout to fire 3ms earlier. Then time delta will be calculated as time difference
    // between two updates and all game logic will be multiplied by it. If loop expects to be executed in 30ms, but is executed in 36ms,
    // then all movement will be multiplied by (36 / 30 = 1,2)

    // const loop = new Loop(() => this.update(), this.tickRate)
    // loop.start()

    setInterval(() => {
      this.update()
    }, this.loopInterval - 5)
  }

  update() {
    // console.time('Update')
    const gameObjects = [
      ...Object.keys(this.mobs).map((key) => this.mobs[key]),
      ...Object.keys(this.players).map((key) => this.players[key]),
      // ...Object.keys(this.projectiles).map((key) => this.projectiles[key]),
    ]

    Object.keys(this.players).forEach((playerKey) => {
      // console.log(this.players[playerKey].isAlive)
    })

    this.updateGameObjects(gameObjects)
    this.handleGameObjectCollisions()
    this.lateUpdateGameObjects(gameObjects)
    this.sendUpdateToPlayers()
    this.setTrigger(() => this.respawnMobs(), /* 150*/ 30)
    this.currentTick += 1
    // this.debugDiffBetweenUpdates()
    // console.timeEnd('Update')
  }

  debugDiffBetweenUpdates() {
    const now = Date.now()
    const diff = now - this.lastUpdateTimestamp
    this.lastUpdateTimestamp = now
    console.log(`${diff.toFixed(2)} ms`)
  }

  findInvokedBy(id: string): GameObject | undefined {
    if (this.players[id]) return this.players[id]
    if (this.mobs[id]) return this.mobs[id]
    return
  }

  setTrigger = (callback: Function, tickAmount: number) => {
    if (this.currentTick % tickAmount == 0) {
      callback()
    }
  }

  updateGameObjects(gameObjects: GameObject[]) {
    gameObjects.forEach((go) => {
      go.onUpdate?.(this.setTrigger)
    })
  }

  lateUpdateGameObjects(gameObjects: GameObject[]) {
    gameObjects.forEach((go) => {
      go.onLateUpdate?.(this.setTrigger)
    })
  }

  preparePlayerForConnection(data: IPrepareUserForConnectionBody) {
    const { connectionId, userId, inventoryItems, equippedItems } = data

    this.connectingPlayers[connectionId] = new Player({
      userId,
      inventoryItems,
      equippedItems,
    })
  }

  connectPlayerToTheGame(socket: Socket, connectionId: string) {
    if (!this.connectingPlayers[connectionId]) {
      console.error('Failed to connect player to the game, no player with provided connectionId')
      return
    }

    this.sockets[socket.id] = socket

    this.players[socket.id] = this.connectingPlayers[connectionId]
    delete this.connectingPlayers[connectionId]

    this.players[socket.id].id = socket.id
    this.players[socket.id].displayedName = socket.id
    this.players[socket.id].itemManager.sendActionBarItems()
    this.players[socket.id].itemManager.sendInventoryItems()
    this.players[socket.id].itemManager.sendEquippedItemsIds()
    this.players[socket.id].updateLevel()
    this.players[socket.id].spawn()

    console.log('player connected to the game')
  }

  removePlayer(socket: Socket) {
    delete this.players[socket.id]
    delete this.sockets[socket.id]
  }

  handleGameObjectCollisions() {
    const gameObjects = [...this.getAlivePlayers(), ...this.getAliveMobs()]

    if (gameObjects.length >= 2) {
      for (let i = 0; i < gameObjects.length; i++) {
        const go1 = gameObjects[i]

        for (let j = i + 1; j < gameObjects.length; j++) {
          const go2 = gameObjects[j]

          if (go1.id === go2.id) {
            // should never occur, but just in case
            continue
          }

          const radSum = go1.size + go2.size
          const distanceVector = Vector2.subtract(go1.position, go2.position)
          const distanceVectorMagnitude = distanceVector.magnitude()
          const goCollided = radSum >= distanceVectorMagnitude

          if (!goCollided) {
            continue
          }

          const penetrationDepth = radSum - distanceVectorMagnitude

          const go1Weight = go1.weight || 1
          const go2Weight = go2.weight || 1
          const weightSum = go1Weight + go2Weight

          const go1penResolutionMultiplier = (go2Weight / weightSum) * penetrationDepth
          const go2penResolutionMultiplier = (go1Weight / weightSum) * -penetrationDepth

          const unitDistanceVector = Vector2.unit(distanceVector)

          const go1penResolution = Vector2.multiply(unitDistanceVector, go1penResolutionMultiplier)
          const go2penResolution = Vector2.multiply(unitDistanceVector, go2penResolutionMultiplier)

          go1.position = Vector2.add(go1.position, go1penResolution)
          go2.position = Vector2.add(go2.position, go2penResolution)
        }
      }
    }
  }

  respawnMobs() {
    const mobKeys = Object.keys(this.mobs)
    const mobsToRespawn = this.maxMobCount - mobKeys.length

    if (mobsToRespawn <= 0) {
      return
    }

    for (let i = 0; i < mobsToRespawn; i++) {
      const randomMobTypeId = getRandomObjectKey(allMobData)

      const mob = new Mob({
        mobDataId: randomMobTypeId,
        level: randomBetween(1, 5),
      })
      this.mobs[mob.id] = mob
    }
  }

  getAlivePlayers(): Player[] {
    return [
      ...Object.keys(this.players)
        .map((key) => this.players[key])
        .filter((player) => player.isAlive),
    ]
  }

  getAliveMobs(): Mob[] {
    return [
      ...Object.keys(this.mobs)
        .map((key) => this.mobs[key])
        .filter((mob) => mob.isAlive),
    ]
  }

  getServerInfo(): IServerInfo {
    return {
      mapSize: this.mapSize,
    }
  }

  sendUpdateToPlayers() {
    const socketKeys = Object.keys(this.sockets)

    // TODO: serialize all mobs and players first instead of serializing them for each player,
    // then only filter the mobs/players needed (based on position)
    for (let i = 0; i < socketKeys.length; i++) {
      const socket = this.sockets[socketKeys[i]]
      const player = this.players[socket.id]

      if (!player) {
        continue
      }

      const update: IUpdate = {
        timestamp: Date.now(),
        me: player.getMe(),
        camera: player.position, // does socket send the whole class or only the object with values?
        hits: this.hits,
        messages: [],
        gameObjects: [
          ...Object.keys(this.players)
            .filter(
              (key) =>
                this.players[key].isAlive || this.players[key].animation?.name === 'death-animation'
            )
            .map((key) => this.players[key].serializeForUpdate()),
          ...Object.keys(this.mobs)
            .filter(
              (key) =>
                this.mobs[key].isAlive || this.mobs[key].animation?.name === 'death-animation'
            )
            .map((key) => this.mobs[key].serializeForUpdate()),
          ...Object.keys(this.projectiles).map((key) => this.projectiles[key]),
        ],
      }

      socket.emit('update', update)
    }
  }
}

export default GameManager
