import { PROFILE_CARD_CLASS } from './ProfileCard.constants.ts'
import type { ProfileCardProps } from './ProfileCard.types.ts'
import './ProfileCard.css'

export function ProfileCard({
  title,
  headingId,
  onSubmit,
  children,
  actions,
}: ProfileCardProps): React.ReactElement {
  const body = (
    <>
      {children}
      <div className={PROFILE_CARD_CLASS.actions}>{actions}</div>
    </>
  )

  return (
    <section className={PROFILE_CARD_CLASS.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={PROFILE_CARD_CLASS.title}>
        {title}
      </h2>
      {onSubmit === undefined ? (
        <div className={PROFILE_CARD_CLASS.form}>{body}</div>
      ) : (
        <form className={PROFILE_CARD_CLASS.form} noValidate onSubmit={onSubmit}>
          {body}
        </form>
      )}
    </section>
  )
}
