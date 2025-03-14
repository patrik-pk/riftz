import React from 'react'
import FullScreen from '@/components/icons/fullscreen.svg'
import Button from '@/components/general/button/Button'
import './options-panel.scss'

const OptionsPanel = () => {
  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.body.requestFullscreen()
    }
  }

  // const [upgradeAvailable, setUpgradeAvailable] = React.useState(false)

  // React.useEffect(() => {
  //   setInterval(() => {
  //     setUpgradeAvailable((prev) => !prev)
  //   }, 1000)
  // }, [])
  const upgradeAvailable = false

  return (
    <div className='gui-options'>
      {/* <div className='button-icon secondary'>
        <Bag />
      </div>
      <div className={`button-icon ${upgradeAvailable ? '' : 'secondary'}`}>
        <Upgrade />
      </div>
      <div className='button-icon secondary'>
        <Settings />
      </div> */}
      <Button icon={<FullScreen />} variant='secondary' onClick={() => toggleFullScreen()} />
    </div>
  )
}

export default OptionsPanel
