import type { ChangeEvent } from 'react'
import type { UseFileSelectParams } from '../KnowledgeUpload.types.ts'

export function useFileSelect({
  onUploadFile,
}: UseFileSelectParams): (event: ChangeEvent<HTMLInputElement>) => void {
  return (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file !== undefined) {
      onUploadFile(file)
    }
  }
}
