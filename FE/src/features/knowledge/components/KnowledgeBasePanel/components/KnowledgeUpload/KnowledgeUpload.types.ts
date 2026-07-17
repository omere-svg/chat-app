export type KnowledgeUploadProps = {
  isUploading: boolean
  uploadError: string | null
  onUploadFile: (file: File) => void
}

export type UseFileSelectParams = {
  onUploadFile: (file: File) => void
}
