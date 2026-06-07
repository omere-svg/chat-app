import { z } from 'zod'

export const createConversationSchema = z.object({
  participantIds: z.array(z.string().min(1)).min(1),
  title: z.string().trim().min(1).optional(),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>
