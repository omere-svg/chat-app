// MongoDB raises error code 11000 on a unique-index violation. Repositories use
// this to distinguish an expected duplicate (e.g. an idempotent retry) from a
// genuine failure.
export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000
}
