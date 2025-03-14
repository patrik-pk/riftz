// reformat and clamp between min and max
// clamp(300, 200, 400) => 0.5
// clamp(200, 200, 400) => 0
// clamp(100, 200, 400) => 0
// clamp(400, 200, 400) => 1
export const clamp = (
  value: number,
  sourceMin: number,
  sourceMax: number,
  destMin: number = 0,
  destMax: number = 1
) => {
  const remap = destMin + ((value - sourceMin) / (sourceMax - sourceMin)) * (destMax - destMin)

  if (remap < destMin) return destMin
  if (remap > destMax) return destMax
  return remap
}

export const clamp01 = (value: number) => {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

export const generateRandomDirection = () => {
  return Math.random() * 2 * Math.PI
}

export const degreeToRad = (degree: number) => {
  return (degree * Math.PI) / 180
}

export const radToDegree = (rad: number) => {
  return (rad * 180) / Math.PI
}

// both numbers are inclusive
export const randomBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getProgress = (createdAt: number, duration: number, reversed?: boolean) => {
  const timeElapsed = Date.now() - createdAt
  let progress = timeElapsed / duration

  if (progress < 0) progress = 0
  if (progress > 1) progress = 1
  if (reversed) progress = 1 - progress

  return progress
}

export const roundToRandom = (number: number): number => {
  const roundedNumber = Math.floor(number)
  const decimalPart = number - roundedNumber

  const randomNumber = Math.random()

  return randomNumber < decimalPart ? Math.floor(number) : Math.ceil(number)
}

export const getRandomObjectKey = (object: Record<string, unknown>): string => {
  const keys = Object.keys(object)
  const randomIndex = Math.floor(Math.random() * keys.length)
  return keys[randomIndex]
}
