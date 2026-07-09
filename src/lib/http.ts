const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const TOKEN_KEY = 'drivers.token'

export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(TOKEN_KEY)
  },
  set(token: string): void {
    window.localStorage.setItem(TOKEN_KEY, token)
  },
  clear(): void {
    window.localStorage.removeItem(TOKEN_KEY)
  },
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown> | FormData
  /** Skip the Authorization header (e.g. for /login). */
  anonymous?: boolean
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, anonymous = false } = options

  const headers: Record<string, string> = {}

  if (!anonymous) {
    const token = tokenStorage.get()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    // Let the browser set the multipart boundary.
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: payload,
    })
  } catch (error) {
    // Network-level failure (connection refused, CORS, offline). Without this
    // the request just hangs from the caller's perspective.
    console.error(`[apiFetch] network error on ${method} ${path}`, error)
    throw error
  }

  if (response.status === 401) {
    tokenStorage.clear()
    throw new ApiError(401, 'Sesión expirada. Inicia sesión de nuevo.')
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let message = text || response.statusText
    try {
      const parsed = text ? JSON.parse(text) : null
      if (parsed && typeof parsed.error === 'string') message = parsed.error
    } catch {
      // Body wasn't JSON — fall back to the raw text/status text above.
    }
    console.error(
      `[apiFetch] ${method} ${path} failed with ${response.status}`,
      message,
    )
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
