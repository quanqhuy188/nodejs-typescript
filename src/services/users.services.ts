import User from '@/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '@/models/requests/Users.requests'

class UsersService {
  constructor() {}
  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth) })
    )
    return result
  }
  async isExitedEmail(email: string) {
    const result = await databaseService.users.findOne({ email })
    return result
  }
}

const usersService = new UsersService()
export default usersService
