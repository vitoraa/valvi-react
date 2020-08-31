import { HttpClient, HttpStatusCode } from '@/data/protocols/http'
import { Authentication } from '@/domain/usecases'
import { InvalidCredentialsError, UnexpectedError } from '@/domain/errors'

export class RemoteAuthentication implements Authentication {
  constructor (
    private readonly url: string,
    private readonly httpClient: HttpClient<RemoteAuthentication.Model>
  ) { }

  async auth (params: Authentication.Params): Promise<RemoteAuthentication.Model> {
    const httpResponde = await this.httpClient.request({
      url: this.url,
      method: 'post',
      body: params
    })

    switch (httpResponde.statusCode) {
      case HttpStatusCode.ok: return httpResponde.body
      case HttpStatusCode.unauthorized: throw new InvalidCredentialsError()
      default: throw new UnexpectedError()
    }
  }
}

export namespace RemoteAuthentication {
  export type Model = Authentication.Model
}
