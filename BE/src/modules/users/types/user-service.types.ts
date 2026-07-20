export interface CreateUserInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface VerifyCredentialsInput {
  email: string
  password: string
}

export interface UpdateNameInput {
  firstName: string
  lastName: string
}
