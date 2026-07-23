const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === MONGO_DUPLICATE_KEY_ERROR_CODE
  )
}
