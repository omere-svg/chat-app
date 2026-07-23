import { MalformedResponseError } from '../malformedResponseError.ts'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function readString(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string {
  const value = record[field]
  if (typeof value !== 'string') {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

export function readOptionalString(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string | undefined {
  const value = record[field]
  if (value === undefined) {
    return undefined
  }
  if (typeof value !== 'string') {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

export function readNullableString(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string | null {
  const value = record[field]
  if (value === undefined || value === null) {
    return null
  }
  if (typeof value !== 'string') {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

export function readNumber(
  record: Record<string, unknown>,
  field: string,
  context: string,
): number {
  const value = record[field]
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

export function readStringArray(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string[] {
  const value = record[field]
  if (!Array.isArray(value)) {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value.map((entry, index) => {
    if (typeof entry !== 'string') {
      throw new MalformedResponseError(`${context}.${field}[${index}]`)
    }
    return entry
  })
}
