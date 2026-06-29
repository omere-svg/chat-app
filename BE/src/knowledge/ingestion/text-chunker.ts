import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { CHUNK_OVERLAP, CHUNK_SIZE } from './chunking.config.js'

// Splits document text into overlapping chunks for embedding. Wraps LangChain's
// RecursiveCharacterTextSplitter behind a narrow port so ingestion depends on the
// strategy, not the library, and the splitter is configured in exactly one place.
@Injectable()
export class TextChunker {
  private readonly splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })

  // Returns non-empty, trimmed chunks in document order. Whitespace-only fragments are
  // dropped so empty chunks never get embedded or cited.
  async chunk(text: string): Promise<string[]> {
    const pieces = await this.splitter.splitText(text)
    return pieces.map((piece) => piece.trim()).filter((piece) => piece.length > 0)
  }
}
