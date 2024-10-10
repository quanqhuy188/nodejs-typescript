// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt')
const saltRounds = 10

export function hashPassword(plainPassword: string): Promise<string | void> {
  return bcrypt
    .hash(plainPassword, saltRounds)
    .then((hashedPassword: string) => {
      return hashedPassword
    })
    .catch((error: Error) => {
      console.error('Error hashing password:', error)
    })
}

export function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean | void> {
  return bcrypt
    .compare(plainPassword, hashedPassword)
    .then((isMatch: boolean) => {
      return isMatch
    })
    .catch((error: Error) => {
      console.error('Error comparing password:', error)
    })
}
