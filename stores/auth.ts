import { defineStore } from 'pinia'
import type { AuthUser, LoginResponse, RefreshResponse } from '~/types'

const STORAGE_KEY_TOKEN = 'ninjatab_access_token'
const STORAGE_KEY_REFRESH = 'ninjatab_refresh_token'
const STORAGE_KEY_USER = 'ninjatab_user'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    refreshToken: null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    currentUser: (state): AuthUser | null => state.user,
    isLoading: (state): boolean => state.loading,
  },

  actions: {
    initFromStorage() {
      if (import.meta.server) return
      const token = localStorage.getItem(STORAGE_KEY_TOKEN)
      const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH)
      const userStr = localStorage.getItem(STORAGE_KEY_USER)

      if (token && userStr) {
        this.token = token
        this.refreshToken = refreshToken
        try {
          this.user = JSON.parse(userStr)
        } catch {
          this.clearAuth()
        }
      }
    },

    persistToStorage() {
      if (import.meta.server) return
      if (this.token && this.user) {
        localStorage.setItem(STORAGE_KEY_TOKEN, this.token)
        localStorage.setItem(STORAGE_KEY_REFRESH, this.refreshToken || '')
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.user))
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN)
        localStorage.removeItem(STORAGE_KEY_REFRESH)
        localStorage.removeItem(STORAGE_KEY_USER)
      }
    },

    async login(email: string) {
      this.loading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000/api'

        const response = await fetch(`${baseURL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({ detail: 'Login failed' }))
          throw new Error(err.detail || `Login failed with status ${response.status}`)
        }

        const data: LoginResponse = await response.json()
        this.token = data.access_token
        this.refreshToken = data.refresh_token
        this.user = data.user
        this.persistToStorage()

        return data.user
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async refreshAccessToken(): Promise<boolean> {
      if (!this.refreshToken) return false

      try {
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000/api'

        const response = await fetch(`${baseURL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        })

        if (!response.ok) {
          this.clearAuth()
          return false
        }

        const data: RefreshResponse = await response.json()
        this.token = data.access_token
        this.persistToStorage()
        return true
      } catch {
        this.clearAuth()
        return false
      }
    },

    logout() {
      this.clearAuth()
    },

    clearAuth() {
      this.token = null
      this.refreshToken = null
      this.user = null
      this.error = null
      this.persistToStorage()
    },

    clearError() {
      this.error = null
    },
  },
})
