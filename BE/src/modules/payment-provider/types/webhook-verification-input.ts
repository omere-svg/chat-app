export type WebhookHeaders = Record<string, string | string[] | undefined>

export interface WebhookVerificationInput {
  rawBody: string
  headers: WebhookHeaders
}
