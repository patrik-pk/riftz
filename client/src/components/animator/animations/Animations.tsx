import { useStoreSelector } from '@/redux/hooks'
import './animations.scss'
import { AnimationDetail } from '@/components/animator/animations/AnimationDetail'
import { AnimationsList } from '@/components/animator/animations/AnimationsList'

const Animations = () => {
  const data = useStoreSelector((state) => state.animator.data)
  const selectedAnimationId = useStoreSelector((state) => state.animator.selectedAnimationId)

  if (!data) {
    return <>no data</>
  }

  return (
    <section className='animations'>
      {selectedAnimationId ? <AnimationDetail /> : <AnimationsList />}
    </section>
  )
}

export default Animations
