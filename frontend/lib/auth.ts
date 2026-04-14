import api from './api'

export type Role = 'customer' | 'admin' | 'support' | 'technician'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
  status: string
  dashboard: string
}

export interface AuthResponse {
  message: string
  token: string
  token_type: string
  user: AuthUser
}

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  // Try localStorage
  const raw = localStorage.getItem('auth_user')
  if (raw) {
    try { return JSON.parse(raw) as AuthUser } catch { }
  }
  // Fallback: read role from cookie and build minimal user
  const roleMatch = document.cookie.match(/auth_role=([^;]+)/)
  if (roleMatch) {
    return { id: 0, name: '', email: '', role: roleMatch[1] as Role, status: 'active', dashboard: `/dashboard/${roleMatch[1]}` }
  }
  return null
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('auth_token')
}

export async function loginUser(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', data)
  return res.data
}

export async function registerUser(data: {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: Role
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', data)
  return res.data
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout')
  clearAuth()
}