import dotenv from 'dotenv'
dotenv.config()
import express, { Application } from 'express'
import session from 'express-session'
import http from 'http'
import cors from 'cors'
// import authRoute from './api/routes/auth/auth'
import filesRoute from './api/routes/files/files'
import authRoute from './api/routes/auth/auth'
import connectionRoute from './api/routes/connection/connection'
// import connectDb from './db/connectDb'
// import upgradeItem from './game/player/upgradeItem'
import cookieParser from 'cookie-parser'
import MongoStore from 'connect-mongo'
import connectDb from './db/connectDb'

const app: Application = express()

const server = http.createServer(app)

app.use(
  cors({
    origin: 'http://localhost:5174', // TODO: set to localhost and domain? need research
    credentials: true,
  })
)

connectDb()

app.use(cookieParser())

const sessionStore = MongoStore.create({ mongoUrl: process.env.mongoURI })

app.use(
  session({
    secret: 'random session secret',
    store: sessionStore,
    cookie: { maxAge: 1_000 * 60 * 60 * 24 },
    saveUninitialized: false,
    resave: false,
    name: 'discord.oauth2',
  })
)

app.use(express.json())
app.use('/assets', express.static('assets'))
app.use('/api/files', filesRoute)
app.use('/api/auth', authRoute)
app.use('/api/connection', connectionRoute)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
