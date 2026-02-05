import type {
  Tab,
  TabListItem,
  CreateTabData,
  Bill,
  BillListItem,
  CreateBillData,
  SubmitSplitsData,
  SimplifyResult,
  UpdateBillData,
  PersonSpendingTotal,
  Settlement,
} from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000/api'

  const apiFetch = async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
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

      get: (id: number) => apiFetch<Tab>(`/tabs/${id}`),

      create: (data: CreateTabData) =>
        apiFetch<Tab>('/tabs/', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      update: (id: number, data: { settlement_currency?: string }) =>
        apiFetch<Tab>(`/tabs/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),

      delete: (id: number) =>
        apiFetch<{ success: boolean }>(`/tabs/${id}`, {
          method: 'DELETE',
        }),

      close: (id: number) =>
        apiFetch<Tab>(`/tabs/${id}/close`, {
          method: 'POST',
        }),

      simplify: (id: number) =>
        apiFetch<SimplifyResult>(`/tabs/${id}/simplify`, {
          method: 'POST',
        }),

      personTotals: (id: number) =>
        apiFetch<PersonSpendingTotal[]>(`/tabs/${id}/person-totals`),

      markSettlementPaid: (settlementId: number) =>
        apiFetch<Settlement>(`/tabs/settlements/${settlementId}/mark-paid`, {
          method: 'POST',
        }),
    },

    // Bill endpoints
    bills: {
      list: (tabId?: number) =>
        apiFetch<BillListItem[]>(
          `/bills/${tabId ? `?tab_id=${tabId}` : ''}`
        ),

      get: (id: number) => apiFetch<Bill>(`/bills/${id}`),

      create: (data: CreateBillData) =>
        apiFetch<Bill>('/bills/', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      submitSplits: (id: number, data: SubmitSplitsData) =>
        apiFetch<Bill>(`/bills/${id}/submit-splits`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      close: (id: number) =>
        apiFetch<Bill>(`/bills/${id}/close`, {
          method: 'POST',
        }),

      update: (id: number, data: UpdateBillData) =>
        apiFetch<Bill>(`/bills/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),

      delete: (id: number) =>
        apiFetch<{ success: boolean }>(`/bills/${id}`, {
          method: 'DELETE',
        }),
    },
  }
}
