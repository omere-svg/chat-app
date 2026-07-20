import { Injectable } from '@nestjs/common'
import { formatFullName } from '../../modules/users/user.mapper.js'
import type { User } from '../../modules/users/types/user.js'
import type { ShapedConversationParticipants } from './types/shaped-conversation-participants.js'

function compareByIdAscending(first: User, second: User): number {
  if (first.id < second.id) {
    return -1
  }
  if (first.id > second.id) {
    return 1
  }
  return 0
}

@Injectable()
export class ConversationParticipantsMapper {
  shape(
    creator: User,
    invitedParticipants: User[],
    requestedTitle: string | undefined,
  ): ShapedConversationParticipants {
    const participantsById = new Map<string, User>()
    for (const participant of [creator, ...invitedParticipants]) {
      participantsById.set(participant.id, participant)
    }
    const participants = [...participantsById.values()].sort(compareByIdAscending)

    const title =
      requestedTitle === undefined
        ? this.deriveTitle(participants)
        : requestedTitle.trim()

    return {
      title,
      participantIds: participants.map((participant) => participant.id),
    }
  }

  deriveTitle(participants: User[]): string {
    return [...participants]
      .sort(compareByIdAscending)
      .map((participant) => formatFullName(participant))
      .join(' & ')
  }
}
