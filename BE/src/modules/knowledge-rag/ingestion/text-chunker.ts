import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { CHUNK_OVERLAP, CHUNK_SIZE } from './chunking.config.js'

@Injectable()
export class TextChunker {
  private readonly splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })

  async chunk(text: string): Promise<string[]> {
    const pieces = await this.splitter.splitText(text)
    return pieces.map((piece) => piece.trim()).filter((piece) => piece.length > 0)
  }
}
