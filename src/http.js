const DEFAULT_MAX_BYTES = 5_000_000

export async function fetchJson(url, options = {}) {
  const {
    timeoutMs = 8_000,
    fetchImpl = globalThis.fetch,
    maxBytes = DEFAULT_MAX_BYTES,
    headers = {},
  } = options

  if (typeof fetchImpl !== "function") {
    throw new Error("fetch is unavailable")
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      redirect: "error",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "user-agent": "opencode-free-models/0.1.0",
        ...headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`)
    }

    const contentLength = Number(response.headers?.get?.("content-length") || 0)
    if (contentLength > maxBytes) {
      throw new Error(`Response too large (${contentLength} bytes) for ${url}`)
    }

    const text = await response.text()
    if (text.length > maxBytes) {
      throw new Error(`Response too large for ${url}`)
    }

    return JSON.parse(text)
  } finally {
    clearTimeout(timer)
  }
}
