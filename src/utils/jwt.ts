import jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as jwt.Secret | jwt.PrivateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey?: jwt.Secret | jwt.PrivateKey
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((res, rej) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        rej(error)
      } else {
        res(token as string)
      }
    })
  })
}
