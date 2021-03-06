import { Authentication, SaveAccessToken } from '@/domain/usecases'
import { Footer, Input, LoginHeader, FormStatus, SubmitButton } from '@/presentation/components'
import { LoginFormContext } from '@/presentation/contexts'
import { Validation } from '@/presentation/protocols'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './login.module.scss'

const { login, form, link } = styles

type LoginProps = {
  validation: Validation
  authentication: Authentication
  saveAccessToken: SaveAccessToken
}

const Login: React.FC<LoginProps> = ({
  validation,
  authentication,
  saveAccessToken
}: LoginProps) => {
  const navigate = useNavigate()

  const [state, setState] = useState({
    isLoading: false,
    isFormInvalid: true,
    email: '',
    password: '',
    emailError: '',
    passwordError: '',
    errorMessage: ''
  })

  useEffect(() => {
    const { email, password } = state
    const formData = { email, password }

    const emailError = validation.validate('email', formData)
    const passwordError = validation.validate('password', formData)

    setState({
      ...state,
      emailError,
      passwordError,
      isFormInvalid: !!emailError || !!passwordError
    })
  }, [state.email, state.password])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    try {
      if (state.isLoading || state.isFormInvalid) return

      setState({
        ...state,
        isLoading: true
      })

      const account = await authentication.auth({
        email: state.email,
        password: state.password
      })

      await saveAccessToken.save(account.accessToken)
      navigate('/')
    } catch (err) {
      setState({
        ...state,
        isLoading: false,
        errorMessage: err.message
      })
    }
  }

  return (
    <div className={login}>
      <LoginHeader />
      <LoginFormContext.Provider value={{ state, setState }}>
        <form data-testid='login-form' className={form} onSubmit={handleSubmit}>
          <h2>Login</h2>
          <Input name='email' type='email' placeholder='Insert your email' />
          <Input type='password' name='password' placeholder='Insert your password' />

          <SubmitButton text='Sign In' />

          <Link data-testid='sign-up-link' to='/sign-up' className={link}>
            sign up
          </Link>
          <FormStatus />
        </form>
      </LoginFormContext.Provider>
      <Footer />
    </div>
  )
}

export { Login }
