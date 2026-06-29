// Retrieval policy for the tutor RAG chain, shared with the eval harness so both
// measure the same configuration.
//
// TOP_K: how many chunks ground an answer. 5 balances enough context to answer a
// multi-part question against keeping the prompt focused and citations few enough to
// scan.
//
// MIN_SCORE: cosine-similarity floor. Chunks below it are treated as irrelevant; if
// nothing clears it the tutor refuses rather than answer ungrounded. Tuned against the
// eval set — see the PR description.
export const TUTOR_RETRIEVAL_TOP_K = 5
export const TUTOR_RETRIEVAL_MIN_SCORE = 0.5
