import Dialog from '@/components/general/dialog/Dialog'
import React from 'react'
import './challenges-dialog.scss'
import ChallengeItem, {
  Challenge,
} from '@/components/dialogs/challenges/challengeItem/ChallengeItem'

const ChallengesDialog: React.FC = () => {
  const testChallenges: Challenge[] = [
    {
      label: 'Do x 10 times',
      currentCount: 3,
      goalCount: 10,
      reward: 10,
      claimed: false,
    },
    {
      label: 'Do x 25 times',
      currentCount: 7,
      goalCount: 25,
      reward: 30,
      claimed: false,
    },
    {
      label: 'Do x 100 times',
      currentCount: 57,
      goalCount: 100,
      reward: 50,
      claimed: false,
    },
    {
      label: 'Do x 100 times',
      currentCount: 100,
      goalCount: 100,
      reward: 120,
      claimed: false,
    },
    {
      label: 'Do x 100 times',
      currentCount: 100,
      goalCount: 100,
      reward: 120,
      claimed: true,
    },
  ]

  return (
    <Dialog id={'challenges'} dialogTitle='Challenges' position='top-right'>
      <>
        <ul className='challenge-items'>
          {testChallenges.map((challenge, i) => {
            return <ChallengeItem challenge={challenge} key={i} />
          })}
        </ul>
      </>
    </Dialog>
  )
}

export default ChallengesDialog
