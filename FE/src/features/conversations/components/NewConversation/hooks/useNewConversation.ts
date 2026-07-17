import { useState } from 'react'
import type { FormEvent } from 'react'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import { CONVERSATIONS_ERROR } from '@/features/conversations/constants/conversations.ts'
import type { UseNewConversationValue } from '../NewConversation.types.ts'

export function useNewConversation(
  onConversationCreated: (conversationId: string) => void,
): UseNewConversationValue {
  const [participantEmail, setParticipantEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function createDirect(): Promise<void> {
    const trimmedParticipantEmail = participantEmail.trim()
    if (!trimmedParticipantEmail || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const { conversation } = await apiClient.createConversation({
        participantEmails: [trimmedParticipantEmail],
      })
      setParticipantEmail('')
      onConversationCreated(conversation.id)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : CONVERSATIONS_ERROR.createDirect,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function createAssistant(): Promise<void> {
    if (isSubmitting) {
      return
    }
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const { conversation } = await apiClient.createAssistantConversation()
      onConversationCreated(conversation.id)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : CONVERSATIONS_ERROR.createAssistant,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function createTutor(): Promise<void> {
    if (isSubmitting) {
      return
    }
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const { conversation } = await apiClient.createTutorConversation()
      onConversationCreated(conversation.id)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : CONVERSATIONS_ERROR.createTutor,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    void createDirect()
  }

  return {
    participantEmail,
    setParticipantEmail,
    isSubmitting,
    errorMessage,
    handleSubmit,
    createAssistant,
    createTutor,
  }
}
