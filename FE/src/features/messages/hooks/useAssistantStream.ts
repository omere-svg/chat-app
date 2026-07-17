import { useEffect, useRef } from "react";
import type { Dispatch, RefObject } from "react";
import { apiClient, ApiError } from "@/api/apiClient.ts";
import type { PendingMessage } from "@/types/domain.ts";
import { MESSAGE_ERROR } from "../constants/messages.ts";
import type {
  MessagesAction,
  MessagesState,
} from "../utils/messageReducer.ts";

export function useAssistantStream(
  conversationId: string | null,
  currentUserId: string,
  onSendError: (errorMessage: string) => void,
  onSendSuccess: (() => void) | undefined,
  state: MessagesState,
  dispatch: Dispatch<MessagesAction>,
  activeConversationIdRef: RefObject<string | null>,
): {
  sendMessage: (messageContent: string) => Promise<boolean>;
  isStreaming: boolean;
} {
  const onSendErrorRef = useRef(onSendError);
  const onSendSuccessRef = useRef(onSendSuccess);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onSendErrorRef.current = onSendError;
    onSendSuccessRef.current = onSendSuccess;
  }, [onSendError, onSendSuccess]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [conversationId]);

  async function sendMessage(messageContent: string): Promise<boolean> {
    if (!conversationId || !messageContent.trim()) {
      return false;
    }

    const targetConversationId = conversationId;
    const trimmedBody = messageContent.trim();
    const clientMessageId = `client-${crypto.randomUUID()}`;
    const placeholderMessageId = `assistant-${crypto.randomUUID()}`;
    const startedAt = new Date().toISOString();

    const optimisticUserMessage: PendingMessage = {
      id: clientMessageId,
      clientMessageId,
      conversationId: targetConversationId,
      senderId: currentUserId,
      body: trimmedBody,
      createdAt: startedAt,
    };

    dispatch({ type: "OPTIMISTIC_ADD", message: optimisticUserMessage });
    dispatch({
      type: "STREAM_START",
      placeholderMessageId,
      conversationId: targetConversationId,
      createdAt: startedAt,
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const isStale = (): boolean =>
      activeConversationIdRef.current !== targetConversationId;

    let userMessageConfirmed = false;

    const handleFailure = (errorMessage: string): void => {
      if (isStale()) {
        return;
      }
      dispatch({ type: "OPTIMISTIC_ROLLBACK", clientMessageId });
      dispatch({ type: "STREAM_ERROR" });
      onSendErrorRef.current(errorMessage);
    };

    try {
      await apiClient.streamAssistantMessage(
        targetConversationId,
        { body: trimmedBody, clientMessageId },
        {
          signal: abortController.signal,
          onUserMessage: (message) => {
            if (isStale()) return;
            userMessageConfirmed = true;
            dispatch({ type: "OPTIMISTIC_CONFIRM", clientMessageId, message });
          },
          onToken: (text) => {
            if (!isStale()) dispatch({ type: "STREAM_TOKEN", text });
          },
          onTool: (name) => {
            if (!isStale()) dispatch({ type: "STREAM_TOOL", name });
          },
          onToolResult: (name) => {
            if (!isStale()) dispatch({ type: "STREAM_TOOL_RESULT", name });
          },
          onCitations: (citations) => {
            if (!isStale()) dispatch({ type: "STREAM_CITATIONS", citations });
          },
          onDone: (message) => {
            if (isStale()) return;
            dispatch({ type: "STREAM_DONE", message });
            onSendSuccessRef.current?.();
          },
          onError: (errorPayload) => handleFailure(errorPayload.message),
        },
      );
      return userMessageConfirmed;
    } catch (error) {
      if (abortController.signal.aborted) {
        if (!isStale()) {
          dispatch({ type: "STREAM_ERROR" });
        }
        return false;
      }
      handleFailure(
        error instanceof ApiError ? error.message : MESSAGE_ERROR.assistant,
      );
      return userMessageConfirmed;
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }

  return { sendMessage, isStreaming: state.streaming !== null };
}
