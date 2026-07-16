import { Injectable } from '@nestjs/common'
import { formatFullName } from '../../users/user-public-view.js'
import type { PublicUser } from '../../users/user-public-view.js'

export interface ShapedConversationParticipants {
  title: string
  participantIds: string[]
}

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

  // Composes a direct-conversation title from participants' current names, sorted by id
  // so it is stable regardless of input order. Used both when creating a conversation and
  // when listing, so titles reflect the latest profile names rather than a stale snapshot.
  deriveTitle(participants: PublicUser[]): string {
    return [...participants]
      .sort(compareByIdAscending)
      .map((participant) => formatFullName(participant))
      .join(' & ')
  }
}
