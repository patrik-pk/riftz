import express, { Request } from 'express'
import { gameManager } from '../server'
import { IPrepareUserForConnectionBody } from 'riftz-shared'

const router = express.Router()

// TODO:
// - test route in api
// - define body interface
// - send info trough api
//   - if info not received, send error response
// - create player in "connectingPlayers" based on data
// - send 200 response
router.post(
  '/prepare-user-for-connection',
  (req: Request<{}, {}, IPrepareUserForConnectionBody>, res, next) => {
    const { connectionId, userId, inventoryItems, equippedItems } = req.body

    if (connectionId === undefined)
      return res.status(400).json({ message: 'No connection id provided' })
    if (userId === undefined) return res.status(400).json({ message: 'No user id provided' })
    if (inventoryItems === undefined)
      return res.status(400).json({ message: 'No inventory items provided' })
    if (equippedItems === undefined)
      return res.status(400).json({ message: 'No equipped items provided' })

    gameManager.preparePlayerForConnection({
      connectionId,
      userId,
      inventoryItems,
      equippedItems,
    })

    res.send('sucessss')
  }
)

export default router
