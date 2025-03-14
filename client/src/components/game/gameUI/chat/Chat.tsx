import { useStoreSelector } from '@/redux/hooks'
import './chat.scss'

const Chat = () => {
  const messages = useStoreSelector((state) => state.update.latestUpdate.messages)

  return (
    <div className={`game-ui-chat`}>
      <ul className='message-list'>
        {messages.map((msg: any) => {
          const msgType = `(${msg.type})`

          return (
            <li key={msg.id} className='message-item'>
              {msg.type && <span className='message-item-type'>{msgType}</span>}
              {msg.from && (
                <span className='message-item-from'>
                  <span>{msg.from.slice(0, 15)}</span>:
                </span>
              )}
              <span className='message-item-text'>{msg.message}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Chat
