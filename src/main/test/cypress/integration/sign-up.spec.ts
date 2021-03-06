import { testFormHelper } from '../support/test-form-helper'
import * as faker from 'faker'
import { mockSignUpRequest } from '../support/mock-sign-up-request'

const populateFields = (): void => {
  const password = faker.internet.password()
  cy.getByTestId('name-input').focus().type(faker.name.findName())
  testFormHelper.testStatusField('name')
  cy.getByTestId('email-input').focus().type(faker.internet.email())
  testFormHelper.testStatusField('email')
  cy.getByTestId('password-input').focus().type(password)
  testFormHelper.testStatusField('password')
  cy.getByTestId('passwordConfirmation-input').focus().type(password)
  testFormHelper.testStatusField('passwordConfirmation')
}

const simulateValidSubmit = (): void => {
  populateFields()
  cy.getByTestId('submit-btn').click()
}

describe('SignUp', () => {
  beforeEach(() => {
    cy.visit('/sign-up')
  })

  it('Should load with correct initial state', () => {
    cy.getByTestId('name-input').should('be.empty').should('have.attr', 'readonly')
    testFormHelper.testStatusField('name', 'Required Field')
    cy.getByTestId('email-input').should('be.empty').should('have.attr', 'readonly')
    testFormHelper.testStatusField('email', 'Required Field')
    cy.getByTestId('password-input').should('be.empty').should('have.attr', 'readonly')
    testFormHelper.testStatusField('password', 'Required Field')
    cy.getByTestId('passwordConfirmation-input').should('be.empty').should('have.attr', 'readonly')
    testFormHelper.testStatusField('passwordConfirmation', 'Required Field')
    cy.getByTestId('submit-btn').should('be.disabled')
    cy.getByTestId('error-wrapper').should('not.have.descendants')
  })

  it('Should present error state if form is invalid', () => {
    cy.getByTestId('name-input').focus().type(faker.random.alphaNumeric(2))
    testFormHelper.testStatusField('name', 'Invalid Field')
    cy.getByTestId('email-input').focus().type(faker.random.word())
    testFormHelper.testStatusField('email', 'Invalid Field')
    cy.getByTestId('password-input').focus().type(faker.random.alphaNumeric(4))
    testFormHelper.testStatusField('password', 'Invalid Field')
    cy.getByTestId('passwordConfirmation-input').focus().type(faker.random.alphaNumeric(4))
    testFormHelper.testStatusField('passwordConfirmation', 'Invalid Field')
    cy.getByTestId('submit-btn').should('be.disabled')
    cy.getByTestId('error-wrapper').should('not.have.descendants')
  })

  it('Should present valid state if form is valid', () => {
    populateFields()
    cy.getByTestId('submit-btn').should('not.be.disabled')
    cy.getByTestId('error-wrapper').should('not.have.descendants')
  })

  it('Should present EmailInUseError', () => {
    mockSignUpRequest.emailInUseError()
    simulateValidSubmit()
    cy.wait('@signup').then(XMLHttpRequest => {
      expect(XMLHttpRequest.response.statusCode).to.eq(403)
      expect(XMLHttpRequest.response.body).haveOwnProperty('error')
    })
    testFormHelper.testExpectedError('E-mail is already being used')
    testFormHelper.testUrl('/sign-up')
  })

  it('Should present UnexpectedError', () => {
    const statusCode = faker.helpers.randomize([400, 404, 500])
    mockSignUpRequest.unexpectedError(statusCode)
    simulateValidSubmit()
    cy.wait('@signup').then(XMLHttpRequest => {
      expect(XMLHttpRequest.response.statusCode).to.eq(statusCode)
      expect(XMLHttpRequest.response.body).haveOwnProperty('error')
    })
    cy.getByTestId('spinner').should('not.exist')
    cy.getByTestId('main-error')
      .should('exist')
      .should('contain.text', 'Something was wrong, try again later.')
  })

  it('Should present UnexpectedError if invalid data is returned', () => {
    mockSignUpRequest.invalidData()
    simulateValidSubmit()
    cy.wait('@signup').then(XMLHttpRequest => {
      expect(XMLHttpRequest.response.statusCode).to.eq(200)
      expect(XMLHttpRequest.response.body).haveOwnProperty('invalidData')
    })
    testFormHelper.testExpectedError('Something was wrong, try again later.')
    testFormHelper.testUrl('/sign-up')
  })

  it('Should present SaveAccessToken if valid credentials are provided', () => {
    mockSignUpRequest.successRequest()
    simulateValidSubmit()
    cy.wait('@signup').then(XMLHttpRequest => {
      expect(XMLHttpRequest.response.statusCode).to.eq(200)
      expect(XMLHttpRequest.response.body).haveOwnProperty('accessToken')
    })
    cy.getByTestId('main-error').should('not.exist')
    cy.getByTestId('spinner').should('not.exist')
    testFormHelper.testUrl()
    testFormHelper.testLocalSTorageItem('accessToken')
  })

  it('Should prevents multiple submits', () => {
    mockSignUpRequest.successRequest()
    populateFields()
    cy.getByTestId('submit-btn').dblclick()
    cy.get('@signup.all').its('length').should('eq', 1)
  })

  it('Should not call submit if form is invalid', () => {
    mockSignUpRequest.successRequest()
    cy.getByTestId('email-input').focus().type(faker.internet.email())
    cy.getByTestId('password-input').focus().type(faker.random.alphaNumeric(4))
    cy.getByTestId('submit-btn').click({ force: true })
    cy.get('@signup.all').its('length').should('eq', 0)
  })
})
