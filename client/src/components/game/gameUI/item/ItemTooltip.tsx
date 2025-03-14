import React from 'react'
import ItemImg from './ItemImg'
import { IEquipItemTyped, IMaterialItemTyped, ItemDestination } from './Item'
import { getItemData } from 'riftz-shared'
import './item-tooltip.scss'

const ItemTooltip: React.FC<{
  item: IEquipItemTyped | IMaterialItemTyped
  destination: ItemDestination
}> = ({ item }) => {
  return (
    <>
      <div className='item-tooltip'>
        <Header item={item} />
        <Description item={item} />
        {/* <AdditionalStats item={item} /> */}
      </div>
    </>
  )
}

const Header: React.FC<{
  item: IEquipItemTyped | IMaterialItemTyped
}> = ({ item }) => {
  // const currentLevel = useStoreSelector((state) => state.update.level.currentLevel)
  const itemData = getItemData(item.itemId)

  if (!itemData) {
    return
  }

  return (
    <header className='item-tooltip-header'>
      <div className='item-tooltip-icon'>
        <ItemImg item={item} />
      </div>
      <p className='item-tooltip-title tooltip-title'>
        {itemData.displayedName}{' '}
        {item.type === 'equip' ? `+${item.upgradeLevel} (${item.uniqueId})` : ''}
      </p>
    </header>
  )
}

const Description: React.FC<{
  item: IEquipItemTyped | IMaterialItemTyped
}> = () => {
  return (
    <>
      <div className='item-tooltip-separator'></div>

      <div className='item-tooltip-description'>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vel cum quibusdam eos tempore
        magnam, optio possimus. Inventore assumenda atque accusamus.
      </div>
    </>
  )
}

// const AdditionalStats: React.FC<{
//   item: IItem
// }> = ({ item }) => {
//   const statKeysWithValues = (Object.keys(item.additionalStats) as IEntityStatsKey[]).filter(
//     (key) => item.additionalStats[key]
//   )

//   if (!statKeysWithValues.length) {
//     return <></>
//   }

//   return (
//     <>
//       <div className='item-tooltip-separator'></div>

//       <ul className='item-tooltip-stats'>
//         {statKeysWithValues.map((key) => (
//           <li className='item-tooltip-stat' key={key}>
//             <p className='its-name'>{statShorthards[key]}</p>
//             <p className='its-value'>+{item.additionalStats[key]}</p>
//           </li>
//         ))}
//       </ul>
//     </>
//   )
// }

export default ItemTooltip
