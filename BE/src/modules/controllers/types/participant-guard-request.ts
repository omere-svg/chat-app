import type { ConversationRequest } from './conversation-request.js'
import type { User } from '../../users/types/user.js'

export interface ParticipantGuardRequest extends ConversationRequest {
  user?: User
}
