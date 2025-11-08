import { defineStore } from 'pinia'
import type { Tab, TabListItem, CreateTabData, TabPerson } from '~/types'

interface TabState {
  tabs: TabListItem[]
  currentTab: Tab | null
  loading: boolean
  error: string | null
}

export const useTabStore = defineStore('tabs', {
  state: (): TabState => ({
    tabs: [],
    currentTab: null,
    loading: false,
    error: null,
  }),

  getters: {
    tabById: (state) => (id: number) => {
      return state.tabs.find((tab) => tab.id === id)
    },

    tabPeople: (state): TabPerson[] => {
      return state.currentTab?.people || []
    },

    isLoading: (state): boolean => {
      return state.loading
    },

    hasError: (state): boolean => {
      return state.error !== null
    },
  },

  actions: {
    async fetchTabs() {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        this.tabs = await api.tabs.list()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch tabs'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTabById(id: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        const tab = await api.tabs.get(id)
        this.currentTab = tab

        // Update the tab in the list if it exists
        const index = this.tabs.findIndex((t) => t.id === id)
        if (index !== -1) {
          this.tabs[index] = {
            id: tab.id,
            name: tab.name,
            description: tab.description,
            default_currency: tab.default_currency,
            is_settled: tab.is_settled,
            bill_count: tab.bill_count,
            created_at: tab.created_at,
            updated_at: tab.updated_at,
          }
        }

        return tab
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch tab'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTab(data: CreateTabData) {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        const newTab = await api.tabs.create(data)

        // Add to tabs list
        this.tabs.unshift({
          id: newTab.id,
          name: newTab.name,
          description: newTab.description,
          default_currency: newTab.default_currency,
          is_settled: newTab.is_settled,
          bill_count: newTab.bill_count,
          created_at: newTab.created_at,
          updated_at: newTab.updated_at,
        })

        this.currentTab = newTab
        return newTab
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create tab'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTab(id: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        await api.tabs.delete(id)

        // Remove from tabs list
        this.tabs = this.tabs.filter((tab) => tab.id !== id)

        // Clear current tab if it's the deleted one
        if (this.currentTab?.id === id) {
          this.currentTab = null
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete tab'
        throw error
      } finally {
        this.loading = false
      }
    },

    setCurrentTab(tab: Tab | null) {
      this.currentTab = tab
    },

    clearError() {
      this.error = null
    },

    $reset() {
      this.tabs = []
      this.currentTab = null
      this.loading = false
      this.error = null
    },
  },
})
