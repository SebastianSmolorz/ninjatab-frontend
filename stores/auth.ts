import { defineStore } from 'pinia'
import type { AuthUser, LoginResponse } from '~/types'

const COOKIE_USER = 'ninjatab_user'

const COOKIE_OPTS = {
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user,
    currentUser: (state): AuthUser | null => state.user,
    isLoading: (state): boolean => state.loading,
  },

  actions: {
    initFromCookie() {
      const user = useCookie<AuthUser | null>(COOKIE_USER, COOKIE_OPTS)
      if (user.value) {
        this.user = user.value
      }
    },

    persistUser() {
      const user = useCookie<AuthUser | null>(COOKIE_USER, COOKIE_OPTS)
      user.value = this.user
    },

    async sendMagicLink(email: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBaseUrl || 'http://localhost:8000/api'

        const response = await fetch(`${baseURL}/auth/magic-link`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        if (response.status === 429) {
          throw new Error("You're doing that too often. Check your spam folder and give it a couple of minutes.")
        }

        if (!response.ok) {
          const err = await response.json().catch(() => ({ detail: 'Failed to send magic link' }))
          throw new Error(err.detail || `Failed with status ${response.status}`)
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to send magic link'
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyMagicLink(token: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBaseUrl || 'http://localhost:8000/api'

        const response = await fetch(`${baseURL}/auth/verify-magic-link`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({ detail: 'Invalid or expired link' }))
          throw new Error(err.detail || `Verification failed with status ${response.status}`)
        }

        const data: LoginResponse = await response.json()
        this.user = data.user
        this.persistUser()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Verification failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async refreshAccessToken(): Promise<boolean> {
      try {
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBaseUrl || 'http://localhost:8000/api'

        const response = await fetch(`${baseURL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          this.clearAuth()
          if (response.status === 401) {
            await navigateTo('/login')
          }
          return false
        }

        return true
      } catch {
        this.clearAuth()
        return false
      }
    },

    async fetchUser(): Promise<void> {
      if (!this.user) return

      try {
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBaseUrl || 'http://localhost:8000/api'

        const response = await fetch(`${baseURL}/auth/me`, {
          credentials: 'include',
        })

        if (!response.ok) return

        const user: AuthUser = await response.json()
        this.user = user
        this.persistUser()
      } catch {
        // Silently fail — cached user remains
      }
    },

    async updateFirstName(firstName: string): Promise<void> {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl || 'http://localhost:8000/api'

      const response = await fetch(`${baseURL}/auth/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to update name' }))
        throw new Error(err.detail || `Failed with status ${response.status}`)
      }

      const user: AuthUser = await response.json()
      this.user = user
      this.persistUser()
    },

    async logout() {
      try {
        const config = useRuntimeConfig()
        const baseURL = config.public.apiBaseUrl || 'http://localhost:8000/api'

        await fetch(`${baseURL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        })
      } catch {
        // Clear local state regardless
      }
      this.clearAuth()
    },

    clearAuth() {
      this.user = null
      this.error = null
      this.persistUser()
    },

    clearError() {
      this.error = null
    },
  },
})
