import { Injectable } from '@nestjs/common'
import { formatFullName } from '../../modules/users/user.mapper.js'
import type { PublicUser } from '../../modules/users/types/user-public-view.js'
import type { ShapedConversationParticipants } from './types/shaped-conversation-participants.js'

function compareByIdAscending(first: PublicUser, second: PublicUser): number {
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
    creator: PublicUser,
    invitedParticipants: PublicUser[],
    requestedTitle: string | undefined,
  ): ShapedConversationParticipants {
    const participantsById = new Map<string, PublicUser>()
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

  deriveTitle(participants: PublicUser[]): string {
    return [...participants]
      .sort(compareByIdAscending)
      .map((participant) => formatFullName(participant))
      .join(' & ')
  }
}
