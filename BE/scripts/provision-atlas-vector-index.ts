// Provisions (or reports) the Atlas Vector Search index on the knowledge_chunks
// collection from the committed definition. Run against an Atlas cluster:
//
//   MONGO_URI="mongodb+srv://..." ATLAS_VECTOR_INDEX=knowledge_chunks_vector_index \
//     npm run provision:vector-index
//
// Idempotent: skips creation when an index of the same name already exists. Local
// Mongo has no Vector Search, so this only does anything against Atlas.
import mongoose from 'mongoose'
import {
  DEFAULT_ATLAS_VECTOR_INDEX,
  KNOWLEDGE_CHUNKS_COLLECTION,
  KNOWLEDGE_CHUNKS_VECTOR_INDEX_DEFINITION,
} from '../src/modules/knowledge-rag/atlas/vector-index.config.js'

async function main(): Promise<void> {
  const uri = process.env.MONGO_URI
  if (uri === undefined || uri.length === 0) {
    throw new Error('MONGO_URI is required')
  }
  const indexName = process.env.ATLAS_VECTOR_INDEX ?? DEFAULT_ATLAS_VECTOR_INDEX

  await mongoose.connect(uri)
  try {
    const db = mongoose.connection.db
    if (db === undefined) {
      throw new Error('Database connection is not established')
    }
    // A search index can only be created on an existing collection, and Mongo creates
    // collections lazily on first insert — so ensure it exists before provisioning.
    const collectionNames = await db
      .listCollections({ name: KNOWLEDGE_CHUNKS_COLLECTION }, { nameOnly: true })
      .toArray()
    if (collectionNames.length === 0) {
      await db.createCollection(KNOWLEDGE_CHUNKS_COLLECTION)
      console.log(`Created empty collection ${KNOWLEDGE_CHUNKS_COLLECTION}.`)
    }
    const collection = db.collection(KNOWLEDGE_CHUNKS_COLLECTION)

    const existing = await collection.listSearchIndexes().toArray()
    if (existing.some((index) => index.name === indexName)) {
      console.log(`Vector index "${indexName}" already exists — nothing to do.`)
      return
    }

    await collection.createSearchIndex({
      name: indexName,
      type: 'vectorSearch',
      definition: KNOWLEDGE_CHUNKS_VECTOR_INDEX_DEFINITION,
    })
    console.log(
      `Created vector index "${indexName}" on ${KNOWLEDGE_CHUNKS_COLLECTION}. ` +
        'Atlas builds it asynchronously; it becomes queryable once status is READY.',
    )
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error: unknown) => {
  console.error('Failed to provision the vector index:', error)
  process.exitCode = 1
})
