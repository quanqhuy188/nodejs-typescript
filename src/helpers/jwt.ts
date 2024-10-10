import { config } from 'dotenv'
import jwt, { GetPublicKeyOrSecret, JwtPayload, Secret } from 'jsonwebtoken'

config()
export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as jwt.Secret | jwt.PrivateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey?: jwt.Secret | jwt.PrivateKey
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        reject(error)
      } else {
        resolve(token as string)
      }
    })
  })
}
export const verifyToken = ({
  token,
  secretOrPublicKey = process.env.JWT_SECRET as string
}: {
  token: string
  secretOrPublicKey?: Secret | GetPublicKeyOrSecret
}) => {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        reject(error)
      } else {
        resolve(decoded as JwtPayload)
      }
    })
  })
}
