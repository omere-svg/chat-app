import { useState } from "react";
import { apiClient, ApiError } from "../../api/apiClient.ts";
import { NewConversationForm } from "./NewConversationForm.tsx";

type NewConversationFormContainerProps = {
  onConversationCreated: (conversationId: string) => void;
};

export function NewConversationFormContainer({
  onConversationCreated,
}: NewConversationFormContainerProps): React.ReactElement {
  const [participantEmail, setParticipantEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    const trimmedParticipantEmail = participantEmail.trim();
    if (!trimmedParticipantEmail || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { conversation } = await apiClient.createConversation({
        participantEmails: [trimmedParticipantEmail],
      });
      setParticipantEmail("");
      onConversationCreated(conversation.id);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Could not start the conversation. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateAssistantConversation(): Promise<void> {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { conversation } = await apiClient.createAssistantConversation();
      onConversationCreated(conversation.id);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Could not start the AI chat. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateTutorConversation(): Promise<void> {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { conversation } = await apiClient.createTutorConversation();
      onConversationCreated(conversation.id);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Could not start the tutor. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <NewConversationForm
        participantEmail={participantEmail}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onParticipantEmailChange={setParticipantEmail}
        onSubmit={() => void handleSubmit()}
      />
      <button
        type="button"
        className="btn btn--secondary new-conversation__assistant"
        disabled={isSubmitting}
        onClick={() => void handleCreateAssistantConversation()}
      >
        {isSubmitting ? "Starting…" : "New AI chat"}
      </button>
      <button
        type="button"
        className="btn btn--secondary new-conversation__tutor"
        disabled={isSubmitting}
        onClick={() => void handleCreateTutorConversation()}
      >
        {isSubmitting ? "Starting…" : "New tutor"}
      </button>
    </>
  );
}
