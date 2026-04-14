import axios from 'axios'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  // Try localStorage first
  const ls = localStorage.getItem('auth_token')
  if (ls) return ls
  // Fallback: read from cookie
  const match = document.cookie.match(/auth_token=([^;]+)/)
  return match ? match[1] : null
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      document.cookie = 'auth_token=; path=/; max-age=0'
      document.cookie = 'auth_role=; path=/; max-age=0'
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api