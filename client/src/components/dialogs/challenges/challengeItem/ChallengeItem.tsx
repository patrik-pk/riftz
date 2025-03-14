import React from 'react'
import './challenge-item.scss'
import Button from '@/components/general/button/Button'
import Currency from '@/components/icons/currency.svg'

export interface Challenge {
  label: string
  currentCount: number
  goalCount: number
  reward: number
  claimed: boolean
}

const ChallengeItem: React.FC<{
  challenge: Challenge
}> = ({ challenge }) => {
  const { label, currentCount, goalCount, reward, claimed } = challenge

  const progress = currentCount / goalCount
  const isFinished = progress === 1

  const claimReward = () => {
    console.log('claim reward')
  }

  return (
    // <li className="challenge">
    //   <div className="challenge-top">
    //     <span className="challenge-top-label">{ label }</span>
    //     <span className="challenge-top-status">{ currentCount } / { goalCount }</span>
    //   </div>
    //   <div className="challenge-bar">
    //     <div className="challenge-bar-active" style={{ width: `${progress * 100}%` }}></div>
    //   </div>
    // </li>
    <li className='chx'>
      <div className='chx-content'>
        <span className='chx-label'>{label}</span>
        <div className='challenge-bar'>
          <span className='challenge-bar-text'>
            {claimed ? (
              <>claimed</>
            ) : (
              <>
                {currentCount} / {goalCount}
              </>
            )}
          </span>
          <div className='challenge-bar-active' style={{ width: `${progress * 100}%` }}></div>
        </div>
      </div>
      <Button className='chx-button' onClick={() => claimReward()} disabled={!isFinished}>
        {reward} <Currency />
      </Button>
    </li>
  )
}

export default ChallengeItem
