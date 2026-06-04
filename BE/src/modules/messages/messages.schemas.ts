import { z } from 'zod'

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1),
  clientMessageId: z.string().min(1).optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>

export const listMessagesQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>
