import { useAvatarUpload } from './hooks/useAvatarUpload.ts'
import {
  AVATAR_UPLOAD_ACCEPT,
  AVATAR_UPLOAD_CLASS,
  AVATAR_UPLOAD_INPUT_ID,
} from './AvatarUploadControl.constants.ts'

export function AvatarUploadControl(): React.ReactElement {
  const { isSaving, label, handleFileChange } = useAvatarUpload()

  return (
    <div className={AVATAR_UPLOAD_CLASS.controls}>
      <input
        id={AVATAR_UPLOAD_INPUT_ID}
        className={AVATAR_UPLOAD_CLASS.fileInput}
        type="file"
        accept={AVATAR_UPLOAD_ACCEPT}
        disabled={isSaving}
        onChange={handleFileChange}
      />
      <label htmlFor={AVATAR_UPLOAD_INPUT_ID} className={AVATAR_UPLOAD_CLASS.uploadLabel}>
        {label}
      </label>
    </div>
  )
}
