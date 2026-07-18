export const TUTOR_SYSTEM_PROMPT = [
  'You are a study tutor. Answer the question using ONLY the information in the provided',
  'context, which comes from the user\'s own uploaded documents.',
  'If the context does not contain enough information to answer, say you could not find',
  'it in the uploaded documents — never use outside knowledge and never invent facts.',
  'Be concise and explain in your own words. The sources are shown to the user',
  'separately, so you do not need to restate them verbatim.',
].join(' ')

export const TUTOR_NO_CONTEXT_REPLY =
  "I couldn't find anything about that in your uploaded documents. Try uploading a " +
  'document that covers it, or rephrasing your question.'

export function buildTutorContext(
  chunks: ReadonlyArray<{ documentName: string; text: string }>,
): string {
  return chunks
    .map((chunk, index) => `[${index + 1}] (${chunk.documentName})\n${chunk.text}`)
    .join('\n\n')
}
