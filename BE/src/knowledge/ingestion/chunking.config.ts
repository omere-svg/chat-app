// Chunking strategy for ingestion, shared by the chunker and the eval harness so both
// measure the same thing.
//
// ~1000 characters with 200 of overlap, split on paragraph -> line -> sentence -> word
// boundaries (RecursiveCharacterTextSplitter defaults). Rationale: 1000 chars is a few
// paragraphs — enough context for a single citation to stand on its own — while the
// 200-char overlap keeps a fact that straddles a boundary retrievable from either side.
export const CHUNK_SIZE = 1000
export const CHUNK_OVERLAP = 200
