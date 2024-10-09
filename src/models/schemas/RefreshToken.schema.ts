import { ObjectId } from 'mongodb'
interface RefreshTokenInterface {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
}

class RefreshToken {
  _id?: ObjectId
  token: string
  created_at: Date
  user_id: ObjectId
  constructor({ _id, token, created_at, user_id }: RefreshTokenInterface) {
    this._id = _id
    this.token = token
    this.created_at = created_at || new Date()
    this.user_id = user_id
  }
}
export default RefreshToken
