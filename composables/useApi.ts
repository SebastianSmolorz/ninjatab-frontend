import type {
  Tab,
  TabListItem,
  TabPerson,
  CreateTabData,
  Bill,
  BillListItem,
  CreateBillData,
  SubmitSplitsData,
  SimplifyResult,
  UpdateBillData,
  PersonSpendingTotal,
  Settlement,
  InviteTabInfo,
  Contact,
} from '~/types'
import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000/api'
  const authStore = useAuthStore()

  const apiFetch = async <T>(
    endpoint: string,
    options?: RequestInit,
    _isRetry = false
  ): Promise<T> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
          ...options?.headers,
        },
      })

      if (!response.ok) {
        if (response.status === 401 && !_isRetry && authStore.refreshToken) {
          const refreshed = await authStore.refreshAccessToken()
          if (refreshed) {
            return apiFetch<T>(endpoint, options, true)
          }
        }

        if (response.status === 401) {
          authStore.logout()
          navigateTo('/login')
          throw new Error('Session expired')
        }

        const error = await response.json().catch(() => ({ message: 'API request failed' }))
        throw new Error(error.message || `Request failed with status ${response.status}`)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }

  return {
    // Tab endpoints
    tabs: {
      list: () => apiFetch<TabListItem[]>('/tabs/'),

      get: (id: string) => apiFetch<Tab>(`/tabs/${id}`),

      create: (data: CreateTabData) =>
        apiFetch<Tab>('/tabs/', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      update: (id: string, data: { settlement_currency?: string }) =>
        apiFetch<Tab>(`/tabs/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),

      delete: (id: string) =>
        apiFetch<{ success: boolean }>(`/tabs/${id}`, {
          method: 'DELETE',
        }),

      close: (id: string) =>
        apiFetch<Tab>(`/tabs/${id}/close`, {
          method: 'POST',
        }),

      simplify: (id: string) =>
        apiFetch<SimplifyResult>(`/tabs/${id}/simplify`, {
          method: 'POST',
        }),

      personTotals: (id: string) =>
        apiFetch<PersonSpendingTotal[]>(`/tabs/${id}/person-totals`),

      markSettlementPaid: (settlementId: string) =>
        apiFetch<Settlement>(`/tabs/settlements/${settlementId}/mark-paid`, {
          method: 'POST',
        }),

      getInvite: (code: string) =>
        apiFetch<InviteTabInfo>(`/tabs/invite/${code}`),

      claimInvite: (code: string, data: { person_id: string; email: string }) =>
        apiFetch<{ success: boolean }>(`/tabs/invite/${code}/claim`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      contacts: (excludeTab?: string) =>
        apiFetch<Contact[]>(`/tabs/contacts${excludeTab ? `?exclude_tab=${excludeTab}` : ''}`),

      addPerson: (tabId: string, data: { name: string; user_id?: string }) =>
        apiFetch<TabPerson>(`/tabs/${tabId}/people`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    // Bill endpoints
    bills: {
      list: (tabId?: string) =>
        apiFetch<BillListItem[]>(
          `/bills/${tabId ? `?tab_id=${tabId}` : ''}`
        ),

      get: (id: string) => apiFetch<Bill>(`/bills/${id}`),

      create: (data: CreateBillData) =>
        apiFetch<Bill>('/bills/', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      submitSplits: (id: string, data: SubmitSplitsData) =>
        apiFetch<Bill>(`/bills/${id}/submit-splits`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      update: (id: string, data: UpdateBillData) =>
        apiFetch<Bill>(`/bills/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),

      delete: (id: string) =>
        apiFetch<{ success: boolean }>(`/bills/${id}`, {
          method: 'DELETE',
        }),
    },
  }
}
