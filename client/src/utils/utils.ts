import { IVector2 } from 'riftz-shared'
import gameStateManager from '../logic/stateManager'

export const degreeToRad = (degree: number) => {
  return (degree * Math.PI) / 180
}

export const clamp01 = (num: number) => {
  return Math.min(Math.max(num, 0), 1)
}

export const smoothen = (x: number): number => {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

export const constrainValue = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const getProgress = (createdAt: number, duration: number, reversed?: boolean) => {
  // const timeElapsed = Date.now() - createdAt
  const timeElapsed = gameStateManager.getCurrentRenderTimestamp() - createdAt
  let progress = timeElapsed / duration

  if (progress < 0) progress = 0
  if (progress > 1) progress = 1
  if (reversed) progress = 1 - progress

  return progress
}

export const deepCopy = (input: any) => {
  if (typeof input !== 'object' || input === null) return input

  let output, value, key
  // Create an array or object to hold the values
  output = Array.isArray(input) ? [] : {}

  for (key in input) {
    value = input[key]

    // Recursively (deep) copy for nested objects, including arrays
    // @ts-ignore
    output[key] = deepCopy(value)
  }

  return output
}

export const formatIdToName = (id: string) => {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const formatScore = (score: number): string | number => {
  // less than 1k
  if (score < 1000) {
    return Math.floor(score)
  }

  // 1k - 9.9k
  if (score < 10000) {
    score = score / 1000
    score = Math.floor(score * 10) / 10
    let result = score + 'k'
    return result
  }

  // 10k - 999k
  if (score < 1000000) {
    score = score / 1000
    score = Math.floor(score)
    let result = score + 'k'
    return result
  }

  // 1mil - 9.9mil
  if (score < 10000000) {
    score = score / 1000000
    score = Math.floor(score * 10) / 10
    let result = score + 'mil'
    return result
  }

  // 10mil - 999mil
  if (score < 1000000000) {
    score = score / 1000000
    score = Math.floor(score)
    let result = score + 'mil'
    return result
  }

  // 1bil+
  score = score / 1000000000
  score = Math.floor(score * 10) / 10
  let result = score + 'bil'
  return result
}

export const calculateDamageReduction = (dp: number): number => {
  return dp / (dp + 100)
}

export const capitalizeFirstLetter = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export const getRandomObjectKey = (object: Record<string, unknown>): string => {
  const keys = Object.keys(object)
  const randomIndex = Math.floor(Math.random() * keys.length)
  return keys[randomIndex]
}

export const awaitTimeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const isPointInBoundingBox = (bb: DOMRect | undefined, point: IVector2): boolean => {
  if (!bb) {
    return false
  }

  return point.x >= bb.left && point.x <= bb.right && point.y >= bb.top && point.y <= bb.bottom
}
