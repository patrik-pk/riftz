import React from 'react'
import Middle from '../middle/Middle'
import './opening-ui.scss'
import Button from '../../../general/button/Button'
import Cube from '../../../icons/cube.svg'
import Map from '../../../icons/map.svg'
import UserInfo from '@/components/game/openingUI/userInfo/UserInfo'
import Login from '@/components/game/openingUI/login/Login'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { setRoute } from '@/redux/reducers/route'

const OpeningUI: React.FC = () => {
  const dispatch = useStoreDispatch()
  const isAlive = useStoreSelector((state) => state.update.isAlive)
  const user = useStoreSelector((state) => state.auth.user)

  const displayUI = !isAlive
  const showOverlay = true

  return (
    <div className={`opening-ui ${displayUI ? 'active' : ''}`}>
      <div className={`opening-ui-overlay ${showOverlay ? 'active' : ''}`}></div>
      <h1 className='opening-ui-logo'>Riftz.io</h1>
      <Middle />

      <div className="opening-ui-top-left">
        <Button
          icon={<Cube />}
          variant='secondary'
          onClick={() => dispatch(setRoute('ANIMATOR'))}
        />
        <Button
          icon={<Map />}
          variant='secondary'
          onClick={() => dispatch(setRoute('MAP-EDITOR'))}
        />
      </div>

      <div className='opening-ui-right'>{user ? <UserInfo /> : <Login />}</div>
    </div>
  )
}

export default OpeningUI
