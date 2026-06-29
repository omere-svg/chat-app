export const EMBEDDINGS_PROVIDER = Symbol('EMBEDDINGS_PROVIDER')

// Turns text into embedding vectors. Ingestion embeds document chunks; the tutor chain
// embeds the user's question. Both go through this port so a test can supply
// deterministic vectors and never call OpenAI.
export interface EmbeddingsProvider {
  // Embeds many chunks in one call (ingestion). Order-preserving: result[i] is the
  // embedding of texts[i].
  embedDocuments(texts: string[]): Promise<number[][]>

  // Embeds a single query string (retrieval).
  embedQuery(text: string): Promise<number[]>
}
