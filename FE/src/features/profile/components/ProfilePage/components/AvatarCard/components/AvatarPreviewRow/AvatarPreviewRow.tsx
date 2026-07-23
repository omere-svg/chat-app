import { AvatarPreview } from '../AvatarPreview/AvatarPreview.tsx'
import { AvatarUploadControl } from '../AvatarUploadControl/AvatarUploadControl.tsx'
import { AVATAR_PREVIEW_ROW_CLASS } from './AvatarPreviewRow.constants.ts'

export function AvatarPreviewRow(): React.ReactElement {
  return (
    <div className={AVATAR_PREVIEW_ROW_CLASS.row}>
      <AvatarPreview />
      <AvatarUploadControl />
    </div>
  )
}
