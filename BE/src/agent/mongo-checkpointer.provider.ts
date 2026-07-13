import { Logger } from '@nestjs/common'
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb'
import type { MongoDBSaverParams } from '@langchain/langgraph-checkpoint-mongodb'
import type { Connection } from 'mongoose'

const logger = new Logger('AgentCheckpointer')

// Builds the LangGraph checkpoint saver on the app's existing Mongoose connection — no
// second connection pool. Checkpoints land in the same database as the rest of the app,
// so conversation state survives a restart and an interrupted run can resume.
//
// Version note: the saver types against mongodb v6 while Mongoose ships v7; the two
// clients are runtime-compatible for the operations the saver uses, so we reuse the
// Mongoose client and bridge the type here.
export async function createMongoCheckpointer(connection: Connection): Promise<MongoDBSaver> {
  const client = connection.getClient() as unknown as MongoDBSaverParams['client']
  const saver = new MongoDBSaver({ client })

  // Idempotent; creates the checkpoint indexes so lookups don't degrade to scans.
  const setupErrors = await saver.setup()
  for (const error of setupErrors) {
    logger.warn(`Checkpoint index setup issue: ${error.message}`)
  }

  return saver
}
