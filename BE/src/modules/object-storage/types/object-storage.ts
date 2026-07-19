export interface CreateUploadUrlInput {
  key: string
  contentType: string
  maxBytes: number
}

export interface UploadUrl {
  url: string
  fields: Record<string, string>
  expiresInSeconds: number
}

export interface StoredObject {
  contentType: string | null
  byteSize: number
}

export interface ObjectStorage {
  createUploadUrl(input: CreateUploadUrlInput): Promise<UploadUrl>
  headObject(key: string): Promise<StoredObject | null>
  deleteObjectQuietly(key: string): Promise<void>
}
