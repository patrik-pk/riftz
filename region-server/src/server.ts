import dotenv from 'dotenv'
dotenv.config()
import express, { Application } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

export interface ServerToClientEvents {

}

export interface ClientToServerEvents {

}

const app: Application = express()

const server = http.createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
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

const PORT = process.env.PORT || 5001

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})

io.on('connection', (socket) => {
  console.log(`New socket connection: ${socket.id}`)
})
