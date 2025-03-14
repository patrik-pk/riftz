import express from 'express'
import User from '../../../db/models/User'
import { getAuthUser, getOrCreateUser, getVerifiedInfo } from './helpers'

const router = express.Router()

// get google redirect url
router.get('/google-redirect-url', (req, res, next) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? '',
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile'].join(' '),
  }

  const qs = new URLSearchParams(options)
  const authUrl = `${rootUrl}?${qs.toString()}`
  return res.json({ authUrl })
})

// get discord redirect url
router.get('/discord-redirect-url', (req, res, next) => {
  const discordAuthorizationUrl = `https://discord.com/oauth2/authorize?response_type=code&redirect_uri=${
    process.env.DISCORD_CLIENT_REDIRECT ?? ''
  }&scope=identify&client_id=${process.env.DISCORD_CLIENT_ID ?? ''}`

  return res.json({ authUrl: discordAuthorizationUrl })
})

// return user data based on session userId
router.get('/user', async (req, res, next) => {
  // TODO?: handle google user
  const userId = req.session?.userId

  if (!userId) {
    return res.status(404).json({ message: 'No session id provided' })
  }

  const user = await User.findById(userId)

  if (!user) {
    return res.status(404).json({ message: 'User with provided session userId not found' })
  }

  return res.json({ user })
})

// process code (given after authorization and redirect from google/discord), set userId to session and return user
router.post('/code', async (req, res, next) => {
  const code = req.body.code
  if (!code) {
    return res.status(400).json({ message: 'Bad Request: Missing "code" parameter' })
  }

  const verifiedInfo = await getVerifiedInfo(code)

  if (!verifiedInfo) {
    return res.status(403).json({ message: 'Discord code verification failed' })
  }

  // get user from verified info
  const authUser = await getAuthUser(verifiedInfo)

  if (!authUser) {
    return res.status(404).json({ message: 'No auth user found with provided access token' })
  }

  // get or create user from MongoDB
  const user = await getOrCreateUser(authUser)

  if (!user) {
    return res.status(404).json({ message: 'Getting/creating user based on Discord user failed' })
  }

  req.session.userId = user.id
  res.json({ user })
})

// logout by removing userId from session
router.get('/logout', (req, res, next) => {
  if (!req.session.userId) {
    return res.status(400).json({ message: 'No user to logout' })
  }

  req.session.userId = null
  res.json({ message: 'Logout successful' })
})

export default router
