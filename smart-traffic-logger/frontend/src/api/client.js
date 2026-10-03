/**
 * Axios client with credentials + CSRF token support.
 * Fetches the CSRF token once on import and attaches it to all mutating requests.
 */
import axios from 'axios'

const client = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let csrfToken = null

async function ensureCsrfToken() {
  if (!csrfToken) {
    try {
      const res = await axios.get('/api/auth/csrf', { withCredentials: true })
      csrfToken = res.data.csrf_token
    } catch {
      // If we can't get the CSRF token, proceed without it (tests / public routes)
    }
  }
  return csrfToken
}

// Attach CSRF token to all state-changing requests
client.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()
  if (['post', 'patch', 'put', 'delete'].includes(method)) {
    const token = await ensureCsrfToken()
    if (token) {
      config.headers['X-CSRFToken'] = token
    }
  }
  return config
})

// On 401, clear any cached token
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      csrfToken = null
    }
    return Promise.reject(err)
  }
)

export const refreshCsrf = async () => {
  csrfToken = null
  return ensureCsrfToken()
}

export default client
