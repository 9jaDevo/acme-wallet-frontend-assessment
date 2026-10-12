import type { ApiErrorBody, ApiSuccess } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ApiError(response.status, 'INVALID_RESPONSE', 'The server returned an invalid response.')
  }

  if (!response.ok) {
    const error = body as Partial<ApiErrorBody>
    throw new ApiError(
      response.status,
      error.error?.code ?? 'REQUEST_FAILED',
      error.error?.message ?? 'The request could not be completed.'
    )
  }

  if (!body || typeof body !== 'object' || !('data' in body)) {
    throw new ApiError(response.status, 'INVALID_RESPONSE', 'The server returned an invalid response.')
  }

  return body as ApiSuccess<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
