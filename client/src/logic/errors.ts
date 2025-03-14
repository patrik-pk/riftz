const errors: string[] = []

export const handleError = (error: string) => {
  if (!errors.includes(error)) {
    console.error(error)
    errors.push(error)
  }
}
