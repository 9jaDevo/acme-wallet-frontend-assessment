import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './client'

afterEach(() => vi.unstubAllGlobals())

describe('API client', () => {
  it('returns successful API data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { id: '1' } }), { status: 200 }))
    )
    await expect(api.get<{ id: string }>('/test')).resolves.toEqual({ data: { id: '1' } })
  })

  it('throws the API code and message for non-2xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Missing' } }), { status: 404 })
        )
    )
    await expect(api.get('/missing')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Missing',
    })
  })

  it('rejects malformed successful responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"unexpected":true}', { status: 200 })))
    await expect(api.get('/test')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
})
