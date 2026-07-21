import type { EmailMessage } from './email-message.js'

export interface EmailSender {
  send(message: EmailMessage): Promise<void>
}
