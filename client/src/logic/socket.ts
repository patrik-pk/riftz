import { eventHandler } from '@/utils/eventHandler'
import { ClientToInstanceServerEvents, InstanceServerToClientEvents } from 'riftz-shared'
import { io, Socket } from 'socket.io-client'

export let socket: Socket<InstanceServerToClientEvents, ClientToInstanceServerEvents> = io('')

export const changeSocketConnection = (url: string, connectionId: string) => {
  socket.close()
  socket = io(url, {
    auth: {
      connectionId
    }
  })

  eventHandler.emit('socket-connection-change', null)
}
