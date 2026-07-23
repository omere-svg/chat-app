export type ThreadViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'success' }
  | { status: 'error'; message: string }
