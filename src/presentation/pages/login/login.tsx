import { Authentication } from '@/domain/usecases'
import {
  Footer,
  Input,
  LoginHeader,
  FormStatus
} from '@/presentation/components'
import { LoginFormContext } from '@/presentation/contexts'
import { Validation } from '@/presentation/protocols'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './login.module.scss'

const { login, form, submit, link } = styles

type LoginProps = {
  validation: Validation
  authentication: Authentication
}

const Login: React.FC<LoginProps> = ({
  validation,
  authentication
}: LoginProps) => {
  const navigate = useNavigate()

  const [state, setState] = useState({
    isLoading: false,
    email: '',
    password: '',
    emailError: '',
    passwordError: '',
    errorMessage: ''
  })

  useEffect(() => {
    setState({
      ...state,
      emailError: validation.validate('email', state.email),
      passwordError: validation.validate('password', state.password)
    })
  }, [state.email, state.password])

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault()

    try {
      if (state.isLoading || state.emailError || state.passwordError) return

      setState({
        ...state,
        isLoading: true
      })

      const account = await authentication.auth({
        email: state.email,
        password: state.password
      })

      localStorage.setItem('accessToken', account.accessToken)
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
        <form data-testid="login-form" className={form} onSubmit={handleSubmit}>
          <h2>Login</h2>
          <Input name="email" type="email" placeholder="Insert your email" />
          <Input
            type="password"
            name="password"
            placeholder="Insert your password"
          />

          <button
            data-testid="submit-btn"
            disabled={!!state.emailError || !!state.passwordError}
            className={submit}
            type="submit"
          >
            Sign In
          </button>
          <Link data-testid="sign-up-route" to="/sign-up" className={link}>
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
