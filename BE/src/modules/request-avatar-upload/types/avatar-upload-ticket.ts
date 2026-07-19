export interface AvatarUploadTicket {
  url: string
  fields: Record<string, string>
  key: string
  expiresInSeconds: number
}
