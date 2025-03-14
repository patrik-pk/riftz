import React, { useState } from 'react'
import './user-info.scss'
import Currency from '@/components/icons/currency.svg'
import Shop from '@/components/icons/shop.svg'
import Challenge from '@/components/icons/challenge.svg'
import User from '@/components/icons/user.svg'
import Button from '@/components/general/button/Button'
import { useStoreDispatch } from '@/redux/hooks'
import { openDialog } from '@/redux/reducers/dialog'
import Select from '@/components/general/select/Select'

const UserInfo: React.FC = () => {
  const dispatch = useStoreDispatch()

  const [selected, setSelected] = useState<string>()

  return (
    <>
      <Select 
        selectedOption={selected} 
        options={[
          {
            label: 'test 222',
            value: 'value1'
          },
          {
            label: 'test 3222',
            value: 'value2'
          },
          {
            label: 'test 3222',
            value: 'value3'
          },
        ]} 
        onOptionSelect={(option) => {
          setSelected(option)
        }}
      />
      <div className='currency'>
        <p className='currency-amount'>100</p>
        <Currency />
      </div>
      <Button 
        className='shop-btn' 
        icon={<Shop />} 
        onClick={() => dispatch(openDialog('shop'))}
      />
      <Button
        className='user-btn'
        icon={<Challenge />}
        iconSize='sm'
        variant='secondary'
        onClick={() => dispatch(openDialog('challenges'))}
      />
      <Button
        className='user-btn'
        icon={<User />}
        iconSize='sm'
        variant='secondary'
        onClick={() => dispatch(openDialog('profile'))}
      />
    </>
  )
}

export default UserInfo
