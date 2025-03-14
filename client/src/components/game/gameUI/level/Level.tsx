import { useStoreSelector } from '@/redux/hooks'
import './level.scss'
import Tooltip from '@/components/general/tooltip/Tooltip'

const Level = () => {
  const currentLevel = useStoreSelector(state => state.update.level.currentLevel)
  const currentXp = useStoreSelector(state => state.update.level.currentXp)
  const xpToNextLevel = useStoreSelector(state => state.update.level.xpToNextLevel)

  const barProgress =
    xpToNextLevel > 0 ? (currentXp / xpToNextLevel) * 100 : 100

  return (
    <div className='ui-level'>
      <Tooltip>{ currentXp } / { xpToNextLevel }</Tooltip>

      <div className='level-bar'>
        <p className='level-bar-info'>
            Level {currentLevel}
        </p>
        <div
          className='level-bar-filled'
          style={{
            width: `${barProgress}%`,
          }}
        ></div>
      </div>
    </div>
  )
}

export default Level
