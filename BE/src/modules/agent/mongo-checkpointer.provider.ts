import { Logger } from '@nestjs/common'
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb'
import type { MongoDBSaverParams } from '@langchain/langgraph-checkpoint-mongodb'
import type { Connection } from 'mongoose'

const logger = new Logger('AgentCheckpointer')

export async function createMongoCheckpointer(connection: Connection): Promise<MongoDBSaver> {
  const client = connection.getClient() as unknown as MongoDBSaverParams['client']
  const saver = new MongoDBSaver({ client })

  const setupErrors = await saver.setup()
  for (const error of setupErrors) {
    logger.warn(`Checkpoint index setup issue: ${error.message}`)
  }

  return saver
}
