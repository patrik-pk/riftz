import React, { useState, useRef, useEffect } from 'react'
import { socket } from '../../../../logic/socket'
import './chat-input.scss'

export let isTyping = false

const chatSwitchOptions: {
  id: string
  name: string
}[] = [
  {
    id: 'local',
    name: 'Local',
  },
  {
    id: 'team',
    name: 'Team',
  },
]

const ChatInput = () => {
  const [input, setInput] = useState('')
  const inputValue = useRef('')
  const [isTypingState, setIsTypingState] = useState<boolean>(isTyping)
  const [switchIndex, setSwitchIndex] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputValue.current = input
  }, [input])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isTypingState, switchIndex])

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEnterPress(e)
    }

    if (e.key === 'Tab') {
      handleTabPress(e)
    }
  }

  const handleTabPress = (e: KeyboardEvent) => {
    if (!isTypingState) {
      return
    }

    e.preventDefault()

    setSwitchIndex(switchIndex + 1 >= chatSwitchOptions.length ? 0 : switchIndex + 1)
  }

  const handleEnterPress = (e: KeyboardEvent) => {
    if (!inputRef.current) {
      return
    }

    if (!isTypingState) {
      inputRef.current.focus()
      handleFocus()
      return
    }

    handleBlur()
    inputRef.current.blur()

    if (inputValue.current.length) {
      socket.emit('sendMessage', {
        type: chatSwitchOptions[switchIndex].id,
        message: inputValue.current,
      })
      setInput('')
    }
  }

  const handleFocus = () => {
    isTyping = true
    setIsTypingState(true)
  }

  const handleBlur = () => {
    isTyping = false
    setIsTypingState(false)
  }

  return (
    <div className={`gui-chat-input ${isTypingState ? 'active' : ''}`}>
      <input
        type='text'
        className='gci-input'
        value={input}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInput(e.target.value)
        }}
        onFocus={(e: React.FocusEvent<HTMLInputElement, Element>) => handleFocus()}
        onBlur={(e: React.FocusEvent<HTMLInputElement, Element>) => handleBlur()}
        ref={inputRef}
      />
      <div className='gci-switch button'>Local</div>
    </div>
  )
}

export default ChatInput

{
  /* <div className='chat-input'>
<div className='chat-input-switch'>
  ({chatSwitchOptions[switchIndex].name})
</div>
<input
  className='chat-input-input'
  value={input}
  onChange={(e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }}
  onFocus={(e: FocusEvent<HTMLInputElement, Element>) => handleFocus()}
  onBlur={(e: FocusEvent<HTMLInputElement, Element>) => handleBlur()}
  ref={inputRef}
/>
</div> */
}
