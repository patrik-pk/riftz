export interface IAbility {
  id: string
  displayedName: string
  description: string
  cooldown: number // in ms
  castTime: number
  animation?: {
    id: string
    // Trigger point defines at which point the logic is triggered. If cast time is 5 seconds
    // and trigger points is 0.3 that means that the animation will play another 0.7.
    // Total duration is calculated: cooldown / triggerPoint
    // e.g. cooldown = 15000, triggerPoints = 0.3, duration = 15000 / 0.3 = 150_000 / 3 = 50_000
    // NOTE: triggerPoint should probably be implemented in animation itself, not here 
    triggerPoint: number 
  }
}

const testAbility: IAbility = {
  id: 'test-ability',
  displayedName: 'Test Ability',
  description: 'random ability description',
  cooldown: 5000,
  castTime: 0
}

const allAbilittiesArray: IAbility[] = [testAbility]

export const allAbilitties: Record<string, IAbility> = {}

allAbilittiesArray.forEach(ability => {
  allAbilitties[ability.id] = ability
})
