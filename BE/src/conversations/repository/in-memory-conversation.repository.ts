import { Injectable, Logger } from '@nestjs/common'
import type { OnModuleInit } from '@nestjs/common'
import { CHAT_SEED } from '../conversations.seed.js'
import type { ConversationRepository } from './conversation-repository.port.js'
import type { ConversationRecord } from '../conversation.entity.js'

function sameParticipantSet(first: readonly string[], second: readonly string[]): boolean {
  if (first.length !== second.length) {
    return false
  }
  const sortedFirst = [...first].sort()
  const sortedSecond = [...second].sort()
  return sortedFirst.every((value, index) => value === sortedSecond[index])
}

function cloneConversation(conversation: ConversationRecord): ConversationRecord {
  return { ...conversation, participantIds: [...conversation.participantIds] }
}

@Injectable()
export class InMemoryConversationRepository implements ConversationRepository, OnModuleInit {
  private readonly logger = new Logger(InMemoryConversationRepository.name)
  private readonly conversationsById = new Map<string, ConversationRecord>()

  onModuleInit(): void {
    for (const conversation of CHAT_SEED.conversations) {
      this.conversationsById.set(conversation.id, cloneConversation(conversation))
    }
    this.logger.log(`Seeded ${this.conversationsById.size.toString()} demo conversations`)
  }

  findById(conversationId: string): Promise<ConversationRecord | null> {
    const conversation = this.conversationsById.get(conversationId)
    return Promise.resolve(conversation === undefined ? null : cloneConversation(conversation))
  }

  findByParticipant(userId: string): Promise<ConversationRecord[]> {
    const conversations = [...this.conversationsById.values()]
      .filter((conversation) => conversation.participantIds.includes(userId))
      .map(cloneConversation)
    return Promise.resolve(conversations)
  }

  findByParticipantSet(participantIds: readonly string[]): Promise<ConversationRecord | null> {
    for (const conversation of this.conversationsById.values()) {
      if (sameParticipantSet(conversation.participantIds, participantIds)) {
        return Promise.resolve(cloneConversation(conversation))
      }
    }
    return Promise.resolve(null)
  }

  insert(conversation: ConversationRecord): Promise<ConversationRecord> {
    const storedConversation = cloneConversation(conversation)
    this.conversationsById.set(storedConversation.id, storedConversation)
    return Promise.resolve(cloneConversation(storedConversation))
  }
}
