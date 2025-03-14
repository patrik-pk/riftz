import api from '@/api/api'
import Button from '@/components/general/button/Button'
import Dialog from '@/components/general/dialog/Dialog'
import React from 'react'
import Discord from '@/components/icons/discord.svg'
import Google from '@/components/icons/google.svg'
import './login-dialog.scss'

const discordLogin = async () => {
  const data = await api.get<{ authUrl: string }>('auth/discord-redirect-url')
  if (!data) {
    return
  }

  window.location.href = data.authUrl
}

const googleLogin = async () => {
  const data = await api.get<{ authUrl: string }>('auth/google-redirect-url')
  if (!data) {
    return
  }

  window.location.href = data.authUrl
}

const LoginDialog: React.FC = () => {
  return (
    <Dialog className='login-dialog' id={'login'} dialogTitle='Login' position='top-right'>
      <>
        <div className="login-buttons">
          <Button className='login-button discord' onClick={discordLogin} variant='other'>
            <Discord />
            <span>with Discord</span>
          </Button>
          <Button className='login-button google' onClick={googleLogin} variant='other'>
            <Google />
            <span>with Google</span>
          </Button>
        </div>
      </>
    </Dialog>
  )
}

export default LoginDialog
