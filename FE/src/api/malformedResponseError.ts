export class MalformedResponseError extends Error {
  constructor(field: string) {
    super(`Malformed server response at ${field}`)
    this.name = 'MalformedResponseError'
  }
}
