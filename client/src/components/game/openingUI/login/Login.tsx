import React from 'react'
import './login.scss'
import Shop from '@/components/icons/shop.svg'
import Button from '@/components/general/button/Button'
import { useStoreDispatch } from '@/redux/hooks'
import { openDialog } from '@/redux/reducers/dialog'

const Login: React.FC = () => {
  const dispatch = useStoreDispatch()
  
  return (
    <>
      <Button className='shop-btn' icon={<Shop />} onClick={() => dispatch(openDialog('shop'))} />
      <Button className='login-btn' onClick={() => dispatch(openDialog('login'))} >
        Login
      </Button>
    </>
  )
}

export default Login
