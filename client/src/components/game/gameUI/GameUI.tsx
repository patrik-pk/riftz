import React, { useMemo } from 'react'
import Chat from './chat/Chat'
import ChatInput from './chat/ChatInput'
import Minimap from './minimap/Minimap'
import ActionBar from './actionBar/ActionBar'
import OptionsPanel from './options-panel/OptionsPanel'
import { useStoreSelector } from '@/redux/hooks'
import './game-ui.scss'
import Level from '@/components/game/gameUI/level/Level'

const GameUI: React.FC = () => {
  const isAlive = useStoreSelector((state) => state.update.isAlive)
  const displayUI = useMemo(() => isAlive, [isAlive])

  return (
    <div className={`game-ui ${displayUI ? 'active' : ''}`}>
      <ChatInput />

      <div className='gui-bottom-left'>
        <Chat />
      </div>

      <div className='gui-top-middle'></div>

      <div className='gui-top-right'>
        <OptionsPanel />
      </div>

      <div className="gui-bottom-middle">
        <Level />
        <ActionBar />
      </div>

      <div className='gui-bottom-right'>
        <Minimap />
      </div>
    </div>
  )
}

export default GameUI
