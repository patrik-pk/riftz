import React from 'react'
import classnames from 'classnames'
import ItemLoader, { ItemLoadingObj } from './ItemLoader'
import ItemTooltip from './ItemTooltip'
import ItemImg from './ItemImg'
import './item.scss'
import { IEquipItem, IMaterialItem } from 'riftz-shared'
import Tooltip, { TooltipPosition } from '../../../general/tooltip/Tooltip'

export type ItemDestination = 'action-bar-item' | 'equip' | 'inventory' | 'other'

export interface IEquipItemTyped extends IEquipItem {
  uniqueId: string
  type: 'equip'
}

export interface IMaterialItemTyped extends IMaterialItem {
  itemId: string
  type: 'material'
}

interface ItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  item?: IEquipItemTyped | IMaterialItemTyped | null
  loading?: ItemLoadingObj
  itemIndex?: number
  destination?: ItemDestination
  isActive?: boolean
  tooltipPosition?: TooltipPosition
  actionBarKey?: string
}

const Item: React.FC<ItemProps> = ({
  item,
  loading,
  destination = 'equip',
  isActive,
  tooltipPosition = 'top',
  actionBarKey,
  className,
  ...rest
}) => {
  const equipItem = () => {
    if (!item) return
    // socket.emit('useItem', item.uniqueId)
  }

  // TODO: lock/plus btn
  return (
    <li
      className={classnames('gui-item-wrapper', className, destination, {
        'currently-equipped': isActive,
        inactive: destination === 'action-bar-item' && !item,
      })}
      {...rest}
    >
      <div className='gui-item' onMouseDown={equipItem}>
        {actionBarKey && <span className='gui-item-key'>{actionBarKey}</span>}
        {loading && <ItemLoader loading={loading} />}
        {item && (
          <>
            <ItemImg item={item} />
            <Tooltip className='item-tooltip-container' position={tooltipPosition}>
              <ItemTooltip item={item} key={item.itemId} destination={destination} />
            </Tooltip>
          </>
        )}
      </div>
    </li>
  )
}

export default Item
