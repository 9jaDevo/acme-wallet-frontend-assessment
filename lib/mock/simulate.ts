/**
 * Network simulation for the mock API. OUT OF SCOPE.
 *
 * Every endpoint accepts a `__scenario` parameter so you can test edge cases:
 *   slow  -> 3s latency
 *   error -> HTTP 500
 *   empty -> empty result (list endpoints only)
 *
 * The scenario is read from the API request's query string, or from the query string of the page
 * that made the request (via the Referer header). So opening `/transactions?__scenario=error`
 * in the browser makes every API call from that page fail.
 *
 * Without a scenario, responses take 200-1500ms and fail ~3% of the time
 * (set MOCK_FAILURE_RATE=0 in .env.local to turn random failures off).
 */
import { NextResponse } from 'next/server'

export type Scenario = 'slow' | 'error' | 'empty' | null

function scenarioFrom(url: string | null): Scenario {
  if (!url) return null
  try {
    const s = new URL(url).searchParams.get('__scenario')
    return s === 'slow' || s === 'error' || s === 'empty' ? s : null
  } catch {
    return null
  }
}

export function getScenario(req: Request): Scenario {
  return scenarioFrom(req.url) ?? scenarioFrom(req.headers.get('referer'))
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function simulateNetwork(
  req: Request,
  opts: { minMs?: number; maxMs?: number; failureRate?: number } = {}
): Promise<NextResponse | null> {
  const scenario = getScenario(req)
  const min = opts.minMs ?? 200
  const max = opts.maxMs ?? 1500

  await sleep(scenario === 'slow' ? 3000 : min + Math.random() * (max - min))

  const failureRate = opts.failureRate ?? Number(process.env.MOCK_FAILURE_RATE ?? 0.03)
  if (scenario === 'error' || Math.random() < failureRate) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    )
  }
  return null
}

export function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status })
}
