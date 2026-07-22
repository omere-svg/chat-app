import { ACCEPTED_UPLOAD_ACCEPT } from '@/features/knowledge/constants/knowledge.ts'
import { useKnowledgeContext } from '../../context/useKnowledgeContext.tsx'
import { useFileSelect } from './hooks/useFileSelect.ts'
import {
  KNOWLEDGE_UPLOAD_CLASS,
  KNOWLEDGE_UPLOAD_INPUT_ID,
  KNOWLEDGE_UPLOAD_TEXT,
} from './KnowledgeUpload.constants.ts'
import './KnowledgeUpload.css'

export function KnowledgeUpload(): React.ReactElement {
  const { isUploading, uploadError, uploadFile } = useKnowledgeContext()
  const handleFileChange = useFileSelect({ onUploadFile: uploadFile })

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
