import { vi } from 'vitest'

export const recordingResponse = () => {
  const response = {
    headers: new Map(),
    body: undefined,
    status: undefined,
    setHeader: vi.fn((name, value) => {
      response.headers.set(name.toLowerCase(), value)
    }),
    writeHead: vi.fn((status, headers = {}) => {
      response.status = status
      for (const [name, value] of Object.entries(headers)) {
        response.headers.set(name.toLowerCase(), value)
      }
    }),
    end: vi.fn((body) => {
      response.body = body
    }),
  }
  return response
}

export const responseJson = (response) => JSON.parse(String(response.body))
