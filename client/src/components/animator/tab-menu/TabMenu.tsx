import './tab-menu.scss'

const TabMenu: React.FC<{
  items: string[]
  activeItem: string
  onItemChange?: (item: string) => void
}> = ({ items, activeItem, onItemChange }) => {
  const handleItemChange = (item: string) => {
    if (item === activeItem) {
      return
    }

    onItemChange?.(item)
  }

  return (
    <div className='tab-menu'>
      {items.map((item, i) => {
        return (
          <div
            className={`tab-menu-item ${activeItem === item ? 'active' : ''}`}
            key={i}
            onClick={() => handleItemChange(item)}
          >
            {item}
          </div>
        )
      })}
    </div>
  )
}

export default TabMenu
