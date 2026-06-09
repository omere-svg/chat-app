import { z } from 'zod'

export const loginRequestSchema = z.object({
  userId: z.string().min(1),
})

export type LoginRequestInput = z.infer<typeof loginRequestSchema>
