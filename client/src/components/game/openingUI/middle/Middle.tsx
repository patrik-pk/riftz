import api from '@/api/api'
import { changeSocketConnection } from '../../../../logic/socket'
import Button from '../../../general/button/Button'
import Input from '../../../general/input/Input'
import './middle.scss'

const Middle = () => {
  const play = async () => {
    const data = await api.post<{ instanceServerAdress: string; connectionId: string }>(
      'connection/play',
      {
        regionId: 'eu',
      }
    )
    if (!data) {
      return
    }

    const { instanceServerAdress, connectionId } = data
    changeSocketConnection(instanceServerAdress, connectionId)
  }

  return (
    <div className='game-middle-ui'>
      <Input placeholder='Username' variant='secondary' />
      <Button onClick={() => play()}>Play</Button>
    </div>
  )
}

export default Middle
