import type { Dispatch, RefObject } from "react";
import { MESSAGE_PAGE_LIMIT } from "../api/constants.ts";
import { apiClient, ApiError } from "../api/apiClient.ts";
import type {
  MessagesAction,
  MessagesState,
} from "../features/messages/messageReducer.ts";

export function useOlderMessages(
  conversationId: string | null,
  state: MessagesState,
  dispatch: Dispatch<MessagesAction>,
  activeConversationIdRef: RefObject<string | null>,
): {
  loadOlderMessages: () => void;
  hasMoreOlderMessages: boolean;
  isLoadingOlderMessages: boolean;
  loadOlderMessagesError: string | null;
} {
  function loadOlderMessages(): void {
    if (
      !conversationId ||
      !state.nextCursor ||
      state.status === "loading-more"
    ) {
      return;
    }

    const targetConversationId = conversationId;
    const olderMessagesCursor = state.nextCursor;

    void (async (): Promise<void> => {
      dispatch({ type: "FETCH_MORE_START" });
      try {
        const { messages, nextCursor } = await apiClient.getMessages(
          targetConversationId,
          { cursor: olderMessagesCursor, limit: MESSAGE_PAGE_LIMIT },
        );
        if (activeConversationIdRef.current !== targetConversationId) {
          return;
        }
        dispatch({
          type: "FETCH_MORE_SUCCESS",
          messages,
          nextCursor,
        });
      } catch (err) {
        if (activeConversationIdRef.current !== targetConversationId) {
          return;
        }
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : "Failed to load older messages";
        dispatch({ type: "FETCH_MORE_ERROR", error: errorMessage });
      }
    })();
  }

  return {
    loadOlderMessages,
    hasMoreOlderMessages: state.nextCursor !== null,
    isLoadingOlderMessages: state.status === "loading-more",
    loadOlderMessagesError: state.loadMoreError,
  };
}
