import { HttpPostClient, HttpStatusCode } from '@/data/protocols'
import { InvalidCredentialsError, UnexpectedError } from '@/domain/error'
import { AccountModel } from '@/domain/models'
import { Authentication, AuthenticationParams } from '@/domain/usecases'

class RemoteAuthentication implements Authentication {
  private readonly url: string;
  private readonly httpPostClient: HttpPostClient<
  AuthenticationParams,
  AccountModel
  >;

  constructor (
    url: string,
    httpPostClient: HttpPostClient<AuthenticationParams, AccountModel>
  ) {
    this.url = url
    this.httpPostClient = httpPostClient
  }

  async auth (params: AuthenticationParams): Promise<AccountModel> {
    const httpResponse = await this.httpPostClient.post({
      url: this.url,
      body: params
    })

    switch (httpResponse.statusCode) {
      case HttpStatusCode.ok:
        return httpResponse.body
      case HttpStatusCode.unauthorized:
        throw new InvalidCredentialsError()
      default:
        throw new UnexpectedError()
    }
  }
}

export { RemoteAuthentication }
