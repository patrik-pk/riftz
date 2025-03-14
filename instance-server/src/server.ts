import dotenv from 'dotenv'
dotenv.config()
import express, { Application } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import GameManager from './gameManager/gameManager'
import Vector2 from './utils/vector2'
import connectionsRoute from './apiRoutes/connections'
import { ClientToInstanceServerEvents, InstanceServerToClientEvents } from 'riftz-shared'

const app: Application = express()

const server = http.createServer(app)
const io = new Server<ClientToInstanceServerEvents, InstanceServerToClientEvents>(server, {
  cors: {
    origin: '*', // http://localhost:5173
    credentials: true,
  },
})

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
)

app.use(express.json())
app.use('/api/connections', connectionsRoute)

const PORT = process.env.PORT || 5010

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})

export const gameManager = new GameManager()

io.on('connection', (socket) => {
  const connectionId = socket.handshake.auth.connectionId
  gameManager.connectPlayerToTheGame(socket, connectionId)

  socket.on('devAddXp', (amount) => {
    const player = gameManager.players[socket.id]
    if (player) {
      player.gainXp(amount)
    }
  })

  socket.emit('serverInfo', gameManager.getServerInfo())

  socket.on('equipItem', (uniqueId) => {
    const player = gameManager.players[socket.id]
    if (player) {
      player.itemManager.equipItem(uniqueId)
    }
  })

  socket.on('unequipItem', (slotKey) => {
    const player = gameManager.players[socket.id]
    if (player) {
      player.itemManager.unequipItem(slotKey)
    }
  })

  socket.on('setPlayerMovement', (movement) => {
    const player = gameManager.players[socket.id]

    if (player) {
      // TODO: send Vector2 from client instead of movement
      const acceleration = new Vector2(movement.horizontal, movement.vertical).unit()
      player.setAcceleration(acceleration)
    }
  })

  socket.on('setPlayerDirection', (direction: number) => {
    const player = gameManager.players[socket.id]
    if (player) {
      player.setDirection(direction)
    }
  })

  socket.on('useItem', (uniqueItemId: string | number) => {
    const player = gameManager.players[socket.id]
    if (player) {
      if (
        (player.itemManager.currentEquippedActionBarItemId === 'primaryWeapon' &&
          uniqueItemId === 0) ||
        (player.itemManager.currentEquippedActionBarItemId === 'secondaryWeapon' &&
          uniqueItemId === 1)
      ) {
        player.itemManager.currentEquippedActionBarItemId = null
      } else {
        if (uniqueItemId === 0) {
          player.itemManager.currentEquippedActionBarItemId = 'primaryWeapon'
        }

        if (uniqueItemId === 1) {
          player.itemManager.currentEquippedActionBarItemId = 'secondaryWeapon'
        }
      }
    }
    // if (player) {
    //   if (typeof uniqueItemId === 'string') {
    //     player.useOrSwapItem(uniqueItemId)
    //     return
    //   }

    //   const itemKey = Object.keys(player.equippedItems)[uniqueItemId]
    //   if (itemKey) {
    //     player.useOrSwapItem(itemKey)
    //   }
    // }
  })

  socket.on('setIsUsingItem', (bool: boolean) => {
    const player = gameManager.players[socket.id]
    if (player) {
      player.itemManager.setIsUsingItem(bool)
    }
  })

  // socket.on('chooseItem', (itemId) => {
  //   const player = gameManager.players[socket.id]
  //   if (player) {
  //     player.chooseItemFromPossibleUpgrades(itemId)
  //   }
  // })

  socket.on('upgradeItem', (upgradeItemId: string, itemIdsToUpgradeWith: string[]) => {
    const player = gameManager.players[socket.id]
    if (player) {
      player.itemManager.upgradeItem(upgradeItemId, itemIdsToUpgradeWith)
    }
  })

  socket.on('disconnect', () => {
    gameManager.removePlayer(socket)
    console.log(`Socket disconnected: ${socket.id}`)
  })
})
