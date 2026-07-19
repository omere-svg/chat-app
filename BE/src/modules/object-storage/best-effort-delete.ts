import { Logger } from '@nestjs/common'
import type { ObjectStorage } from './types/object-storage.js'

const logger = new Logger('ObjectStorageCleanup')

export async function deleteObjectBestEffort(
  objectStorage: ObjectStorage,
  key: string,
): Promise<void> {
  try {
    await objectStorage.deleteObject(key)
  } catch (error) {
    logger.warn(`Failed to delete object ${key}: ${String(error)}`)
  }
}
