import api from '@/api/api'
import Button from '@/components/general/button/Button'
import Dialog from '@/components/general/dialog/Dialog'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { setUser } from '@/redux/reducers/auth'
import React from 'react'

const ProfileDialog: React.FC = () => {
  const dispatch = useStoreDispatch()
  const user = useStoreSelector(state => state.auth.user)

  const logout = async () => {
    const data = await api.get('auth/logout')
    if (!data) {
      return
    }
    
    dispatch(setUser(null))
  }

  return <>
    <Dialog id={'profile'} dialogTitle='Profile' position='top-right'>
      {user && (
        <>
          {user.discordAuth && (
            <div className='discord-user'>
              <img
                src={`https://cdn.discordapp.com/avatars/${user?.discordAuth.id}/${user?.discordAuth.avatar}.png`}
                alt=''
              />
              <p>{user.discordAuth.globalName}</p>
            </div>
          )}
          {user.googleAuth && (
            <div className='google-user'>
              <img src={user.googleAuth.picture} alt='' />
              <p>{user.googleAuth.name}</p>
            </div>
          )}
          <Button onClick={logout}>Logout</Button>
        </>
      )}
    </Dialog>
  </>
}

export default ProfileDialog
