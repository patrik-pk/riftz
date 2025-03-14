import config from '@/config'
import React from 'react'
import './item-image.scss'
import { IEquipItemTyped, IMaterialItemTyped } from './Item'
import { getItemData } from 'riftz-shared'

const ItemImg: React.FC<{
  item: IEquipItemTyped | IMaterialItemTyped
}> = ({ item }) => {
  const itemData = getItemData(item.itemId)

  if (!itemData) {
    return
  }

  if (itemData.icon.type === 'url') {
    return (
      <>
        <img
          className='gui-item-img'
          src={`${config.API_URL}/assets/${itemData.icon.path}`}
          alt=''
        />
        {/* <img
          className='gui-item-img'
          id={item.subtype}
          src={`${config.API_URL}/assets/${item.iconPath}.png`}
          alt=''
        />
        {item.renderGameObjectId === 'player-daggers' && (
          <img
            className='gui-item-img'
            id={item.subtype}
            src={`${config.API_URL}/assets/${item.iconPath}.png`}
            alt=''
          />
        )} */}
      </>
    )
  }

  if (itemData.icon.type === 'specific' && itemData.icon.id === 'daggers') {
    return (
      <>
        <img
          className='gui-item-img'
          id='daggers'
          src={`${config.API_URL}/assets/items/diamond-dagger.png`}
          alt=''
        />
        <img
          className='gui-item-img'
          id='daggers'
          src={`${config.API_URL}/assets/items/diamond-dagger.png`}
          alt=''
        />
      </>
    )
  }
}

export default ItemImg
