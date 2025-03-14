import { useStoreSelector } from '@/redux/hooks'
import Item from '../item/Item'
import './action-bar.scss'

const ActionBar = () => {
  const actionBarItems = useStoreSelector((state) => state.update.actionBarItems)
  // const abilitySlots = ['0', '1', '2', '3', '4', '5']

  return (
    <div className='action-bar'>
      <ul className='action-bar-items'>
        {/* Primary weapon */}
        <Item
          item={actionBarItems.primaryWeapon && { ...actionBarItems.primaryWeapon, type: 'equip' }}
          loading={undefined}
          isActive={false}
          actionBarKey='1'
          destination='action-bar-item'
        />

        {/* Secondary weapon */}
        <Item
          item={
            actionBarItems.secondaryWeapon && { ...actionBarItems.secondaryWeapon, type: 'equip' }
          }
          loading={undefined}
          isActive={false}
          actionBarKey='2'
          destination='action-bar-item'
        />

        {/* Ability slots */}
        {/* {abilitySlots.map((slot, i) => {
          return (
            <Item
              key={slot}
              item={actionBarItems[slot as keyof typeof actionBarItems]}
              loading={undefined}
              isActive={false}
              actionBarKey={String(i + 3)}
              type='action-bar-item'
            />
          )
        })} */}
      </ul>

      {/* <ul className='ilp-items'>
        {Object.values(equippedItems).map((item, i) => {
          const loading = (() => {
            if ('triggerTimestamps' in item) {
              return item.triggerTimestamps as ITriggerItemTimestamps
            }
            if ('readyToUseTimestamp' in item) {
              const ability = item as IAbility
              return {
                start: ability.readyToUseTimestamp - ability.cooldown,
                finish: ability.readyToUseTimestamp,
              }
            }
          })()

          return (
            <Item
              key={item.itemId}
              item={item}
              loading={loading}
              itemIndex={i}
              isActive={currentItemId === item.uniqueId}
            />
          )
        })}
      </ul> */}
    </div>
  )
}

export default ActionBar
