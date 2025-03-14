import { IVector2 } from 'riftz-shared'

interface ICircleCollisionObject {
  position: IVector2
  size: number
}

export const circleCollision = (
  obj1: ICircleCollisionObject,
  obj2: ICircleCollisionObject
): boolean => {
  const dx = obj1.position.x - obj2.position.x
  const dy = obj1.position.y - obj2.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance <= obj1.size + obj2.size
}
