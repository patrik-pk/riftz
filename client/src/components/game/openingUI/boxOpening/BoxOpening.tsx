import React, { useMemo } from 'react'
import './box-opening.scss'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { capitalizeFirstLetter } from '@/utils/utils'
import { revealItem, setItems } from '@/redux/reducers/boxOpening'
import Button from '@/components/general/button/Button'

const BoxOpening: React.FC = () => {
  const dispatch = useStoreDispatch()
  const items = useStoreSelector((state) => state.boxOpening.items)
  const allItemsRevealed = useMemo(() => !items.find((item) => !item.revealed), [items])

  if (!items.length) {
    return
  }

  return (
    <div className='bo'>
      <ul className='bo-items'>
        {items.map((item, i) => {
          return (
            <li
              className={`bo-item ${item.revealed ? 'revealed' : ''} ${item.rarity}`}
              key={i}
              onClick={() => dispatch(revealItem(i))}
            >
              <div className='bo-item-img'></div>
              <div className='bo-item-content'>
                <span className='bo-item-label'>{item.label}</span>
                <span className={`bo-item-rarity ${item.rarity}`}>
                  {capitalizeFirstLetter(item.rarity)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <Button
        className={`continue-btn ${allItemsRevealed ? 'all-revealed' : ''}`}
        onClick={() => dispatch(setItems([]))}
      >
        Continue
      </Button>
    </div>
  )
}

export default BoxOpening
