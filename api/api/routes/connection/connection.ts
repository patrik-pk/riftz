import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import express, { Request } from 'express'
import User from '../../../db/models/User'
import { Api } from '../api'
import { IPrepareUserForConnectionBody } from 'riftz-shared'

const router = express.Router()

const instaceServerIdAddressPair: Record<string, string> = {
  'map-1': 'http://localhost:5010',
  'map-2': 'http://localhost:5011',
}

interface PlayBody {
  regionId: string
}

router.post('/play', async (req: Request<{}, {}, PlayBody>, res, next) => {
  const userId = req.session.userId
  const regionId = req.body.regionId

  if (!regionId) return res.status(400).json({ message: 'No region id provided' })
  if (!userId) return res.status(400).json({ message: 'No session id provided' })

  const user = await User.findById(userId)

  if (!user) {
    return res.status(404).json({ message: 'User with provided session userId not found' })
  }

  // @ts-ignore
  const instanceServerId = user.currentInstanceId ?? 'map-1' // TODO
  const instanceServerAdress = instaceServerIdAddressPair[instanceServerId]

  if (!instanceServerAdress) {
    res.status(500).json({
      message: `Instance server address not found for: ${regionId}, ${instanceServerId}`,
    })
    return
  }

  const connectionId = uuidv4()

  const prepareBody: IPrepareUserForConnectionBody = {
    connectionId,
    userId: user.id,
    inventoryItems: {
      materials: {},
      equip: {
        '123': {
          itemId: 'daggers',
          upgradeLevel: 5,
        },
        '321': {
          itemId: 'daggers',
          upgradeLevel: 1,
        },
        'armor-1': {
          itemId: 'armor',
          upgradeLevel: 3,
        },
        'armor-2': {
          itemId: 'armor',
          upgradeLevel: 5,
        },
        'wings-123': {
          itemId: 'wings',
          upgradeLevel: 1,
        },
        'test-accessory': {
          itemId: 'accessory',
          upgradeLevel: 3,
        },
        'test-shield': {
          itemId: 'shield',
          upgradeLevel: 1,
        },
      },
    },
    equippedItems: {
      primaryWeapon: '123',
      secondaryWeapon: null,
      armor: 'armor-2',
      accessory: null,
      wings: null,
      necklace: null,
      belt: null,
      ring: null,
    },
  }

  const userPreparationResponse = await Api.post<IPrepareUserForConnectionBody>(
    'http://localhost:5010/api/connections/prepare-user-for-connection',
    prepareBody
  )

  if (!userPreparationResponse) {
    return res.status(500).json({
      message: `Failed to connect user to instance server: ${regionId}, ${instanceServerId}`,
    })
  }

  // after user gets connected to instance server, connect him to regional aswell

  res.json({ instanceServerAdress, connectionId })
})

export default router
