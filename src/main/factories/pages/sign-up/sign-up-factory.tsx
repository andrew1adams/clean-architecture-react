import React from 'react'
import { SignUp } from '@/presentation/pages'
import {
  SignUpValidationCreator,
  LocalSaveAccessTokenCreator,
  RemoteAddAccountCreator
} from '@/main/factories'

const SignUpComponent: React.FC = () => (
  <SignUp
    addAccount={RemoteAddAccountCreator()}
    validation={SignUpValidationCreator()}
    saveAccessToken={LocalSaveAccessTokenCreator()}
  />
)

export { SignUpComponent }
