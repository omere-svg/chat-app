export interface CreateUploadUrlInput {
  key: string
  contentType: string
}

export interface UploadUrl {
  uploadUrl: string
  expiresInSeconds: number
}

export interface StoredObject {
  contentType: string | null
  byteSize: number
}

export interface ObjectStorage {
  createUploadUrl(input: CreateUploadUrlInput): Promise<UploadUrl>
  headObject(key: string): Promise<StoredObject | null>
  deleteObject(key: string): Promise<void>
}
