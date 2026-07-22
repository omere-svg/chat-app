export function isSessionSuperseded(
  sessionsInvalidatedAt: Date | null | undefined,
  tokenIssuedAtSeconds: number | undefined,
): boolean {
  if (sessionsInvalidatedAt === null || sessionsInvalidatedAt === undefined) {
    return false
  }
  if (tokenIssuedAtSeconds === undefined) {
    return true
  }
  return tokenIssuedAtSeconds * 1000 < sessionsInvalidatedAt.getTime()
}
