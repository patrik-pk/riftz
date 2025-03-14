import axios from 'axios'
import User from '../../../db/models/User'
import { Document } from 'mongoose'
import qs from 'qs'
import jwt from 'jsonwebtoken'

declare module 'express-session' {
  export interface SessionData {
    userId: string | null
  }
}

interface CodeVerificationResponseData {
  token_type: string
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  id_token?: string // google send this
}

interface DiscordUser {
  id: string
  username: string
  global_name: string
  avatar: string // https://cdn.discordapp.com/avatars/${id}/${avatar}.png
}

interface GoogleUser {
  sub: string // unique id
  name: string
  picture: string // sends valid url
  given_name: string
  family_name: string
  locale: string
}

const codeVerificationData = (code: string) => {
  return new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID ?? '',
    client_secret: process.env.DISCORD_CLIENT_SECRET ?? '',
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.DISCORD_CLIENT_REDIRECT ?? '',
    scope: 'identify',
  }).toString()
}

export const verifyDiscordCode = async (
  code: string
): Promise<CodeVerificationResponseData | undefined> => {
  try {
    const response = await axios.post<CodeVerificationResponseData>(
      'https://discord.com/api/oauth2/token',
      codeVerificationData(code),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    return response.data
  } catch (err) {
    // console.error(err)
    return
  }
}

export const verifyGoogleCode = async (
  code: string
): Promise<CodeVerificationResponseData | undefined> => {
  try {
    const url = 'https://oauth2.googleapis.com/token'

    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? '',
      grant_type: 'authorization_code',
    }

    const response = await axios.post<CodeVerificationResponseData>(url, qs.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return response.data
  } catch (err) {
    // console.error(err)
    return
  }
}

interface VerifiedInfo {
  type: 'discord' | 'google'
  data: CodeVerificationResponseData
}

export const getVerifiedInfo = async (code: string): Promise<VerifiedInfo | undefined> => {
  const discordInfo = await verifyDiscordCode(code)

  if (discordInfo) {
    return {
      type: 'discord',
      data: discordInfo,
    }
  }

  const googleInfo = await verifyGoogleCode(code)

  if (googleInfo) {
    return {
      type: 'google',
      data: googleInfo,
    }
  }

  return
}

interface AuthUser {
  type: 'discord' | 'google'
  user: DiscordUser | GoogleUser
}

export const getAuthUser = async (verifiedInfo: VerifiedInfo): Promise<AuthUser | undefined> => {
  if (verifiedInfo.type === 'discord') {
    const user = await getDiscordUser(verifiedInfo.data.token_type, verifiedInfo.data.access_token)
    if (user) return { type: verifiedInfo.type, user }
  }

  if (verifiedInfo.type === 'google') {
    const decoded = jwt.decode(verifiedInfo.data.id_token ?? '') as GoogleUser
    if (decoded) return { type: verifiedInfo.type, user: decoded }
  }
}

export const getGoogleUser = async (
  tokenType: string,
  accessToken: string
): Promise<GoogleUser | undefined> => {
  try {
    const response = await axios.get<GoogleUser>('https://discord.com/api/users/@me', {
      headers: { authorization: `${tokenType} ${accessToken}` },
    })

    return response.data
  } catch (err) {
    // console.error(err)
    return
  }
}

export const getDiscordUser = async (
  tokenType: string,
  accessToken: string
): Promise<DiscordUser | undefined> => {
  try {
    const response = await axios.get<DiscordUser>('https://discord.com/api/users/@me', {
      headers: { authorization: `${tokenType} ${accessToken}` },
    })

    return response.data
  } catch (err) {
    // console.error(err)
    return
  }
}

export const getOrCreateUser = async (authUser: AuthUser): Promise<Document | undefined> => {
  try {
    if (authUser.type === 'discord') {
      const discordUser = authUser.user as DiscordUser

      let user = await User.findOne({ 'discordAuth.id': discordUser.id })

      if (!user) {
        const newUser = await User.create({
          discordAuth: {
            id: discordUser.id,
            username: discordUser.username,
            avatar: discordUser.avatar,
            globalName: discordUser.global_name,
          },
          googleAuth: null,
        })

        user = await newUser.save()
      }

      return user
    }

    if (authUser.type === 'google') {
      const googleUser = authUser.user as GoogleUser
      let user = await User.findOne({ 'googleAuth.id': googleUser.sub })

      if (!user) {
        const newUser = await User.create({
          googleAuth: {
            id: googleUser.sub,
            name: googleUser.name,
            picture: googleUser.picture,
          },
        })

        user = await newUser.save()
      }

      return user
    }
  } catch (err) {
    console.log(err)
    return
  }
}
