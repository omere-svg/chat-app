import { ACCEPTED_UPLOAD_ACCEPT } from '@/features/knowledge/constants/knowledge.ts'
import { useFileSelect } from './hooks/useFileSelect.ts'
import {
  KNOWLEDGE_UPLOAD_CLASS,
  KNOWLEDGE_UPLOAD_INPUT_ID,
  KNOWLEDGE_UPLOAD_TEXT,
} from './KnowledgeUpload.constants.ts'
import type { KnowledgeUploadProps } from './KnowledgeUpload.types.ts'
import './KnowledgeUpload.css'

export function KnowledgeUpload({
  isUploading,
  uploadError,
  onUploadFile,
}: KnowledgeUploadProps): React.ReactElement {
  const handleFileChange = useFileSelect({ onUploadFile })

  return (
    <div className={KNOWLEDGE_UPLOAD_CLASS.upload}>
      <input
        id={KNOWLEDGE_UPLOAD_INPUT_ID}
        className={KNOWLEDGE_UPLOAD_CLASS.fileInput}
        type="file"
        accept={ACCEPTED_UPLOAD_ACCEPT}
        disabled={isUploading}
        onChange={handleFileChange}
      />
      <label
        htmlFor={KNOWLEDGE_UPLOAD_INPUT_ID}
        className={KNOWLEDGE_UPLOAD_CLASS.label}
      >
        {isUploading ? KNOWLEDGE_UPLOAD_TEXT.uploading : KNOWLEDGE_UPLOAD_TEXT.idle}
      </label>
      {uploadError ? (
        <p className={KNOWLEDGE_UPLOAD_CLASS.error} role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  )
}
