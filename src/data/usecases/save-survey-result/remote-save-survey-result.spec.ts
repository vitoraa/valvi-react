import faker from 'faker'
import { HttpClientSpy, mockRemoteSurveyResultModel } from '@/data/test'
import { HttpStatusCode } from '@/data/protocols/http'
import { RemoteSaveSurveyResult } from '@/data/usecases'
import { mockSaveSurveyResultParams } from '@/domain/test'
import { AccessDeniedError, UnexpectedError } from '@/domain/errors'

type SutTypes = {
  sut: RemoteSaveSurveyResult
  httpClientSpy: HttpClientSpy
}

const makeSut = (url = faker.internet.url()): SutTypes => {
  const httpClientSpy = new HttpClientSpy()
  const sut = new RemoteSaveSurveyResult(url, httpClientSpy)
  return {
    sut,
    httpClientSpy
  }
}

describe('RemoteLoadSurveyResult', () => {
  test('Should call HttpClient with correct URL, body and Method', async () => {
    const url = faker.internet.url()
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.ok,
      body: mockRemoteSurveyResultModel()
    }
    const answer = mockSaveSurveyResultParams()
    await sut.save(answer)
    expect(httpClientSpy.url).toBe(url)
    expect(httpClientSpy.method).toBe('put')
    expect(httpClientSpy.body).toBe(answer)
  })

  test('Should throw AccessDeniedError if HttpClient returns 403', async () => {
    const { sut, httpClientSpy } = makeSut()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.forbiden
    }
    const promise = sut.save(mockSaveSurveyResultParams())
    await expect(promise).rejects.toThrow(new AccessDeniedError())
  })

  test('Should throw UnexpectedError if HttpClient returns 404', async () => {
    const { sut, httpClientSpy } = makeSut()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.notFound
    }
    const promise = sut.save(mockSaveSurveyResultParams())
    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('Should throw UnexpectedError if HttpClient returns 500', async () => {
    const { sut, httpClientSpy } = makeSut()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.serverError
    }
    const promise = sut.save(mockSaveSurveyResultParams())
    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('Should return a SurveyResultModel if HttpClient returns 200', async () => {
    const httpResult = mockRemoteSurveyResultModel()
    const { sut, httpClientSpy } = makeSut()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.ok,
      body: httpResult
    }
    const surveyResult = await sut.save(mockSaveSurveyResultParams())
    expect(surveyResult).toEqual({
      question: httpResult.question,
      date: new Date(httpResult.date),
      answers: httpResult.answers
    })
  })
})
