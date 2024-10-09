import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import dotenv, { config } from 'dotenv'
import User from '@/models/schemas/User.schema'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
config()

const uri: string = process.env.DB_URL || ''

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('An error occurred while connecting to MongoDB:', error)
    } finally {
      // Ensures that the client will close when you finish/error
      //await this.client.close()
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }
}
const databaseService = new DatabaseService()
export default databaseService
