import { defineStore } from 'pinia'
import type {
  Bill,
  BillListItem,
  CreateBillData,
  SubmitSplitsData,
  LineItem,
  DraftSplits,
  SplitMode,
  TabPerson,
  SplitType,
  LineItemSplitSubmit,
} from '~/types'

interface BillState {
  bills: BillListItem[]
  currentBill: Bill | null
  loading: boolean
  error: string | null
  splitMode: SplitMode
  draftSplits: DraftSplits
}

export const useBillStore = defineStore('bills', {
  state: (): BillState => ({
    bills: [],
    currentBill: null,
    loading: false,
    error: null,
    splitMode: 'even' as SplitMode,
    draftSplits: {},
  }),

  getters: {
    billById: (state) => (id: number) => {
      return state.bills.find((bill) => bill.id === id)
    },

    billsByTabId: (state) => (tabId: number) => {
      return state.bills.filter((bill) => {
        // This would need the tab_id on BillListItem, or we fetch filtered
        // For now, we'll need to filter on the API side
        return true
      })
    },

    currentLineItems: (state): LineItem[] => {
      return state.currentBill?.line_items || []
    },

    totalBillAmount: (state): number => {
      return state.currentBill?.total_amount || 0
    },

    isValidSplit: (state): boolean => {
      if (!state.currentBill) return false

      for (const lineItem of state.currentBill.line_items) {
        const splits = state.draftSplits[lineItem.id]
        if (!splits) continue

        const splitValues = Object.values(splits).filter((v) => v !== null) as number[]

        if (splitValues.length === 0) continue

        if (lineItem.split_type === 'value') {
          const total = splitValues.reduce((sum, val) => sum + val, 0)
          if (total > lineItem.value) {
            return false
          }
        }
      }

      return true
    },

    personTotalOwed: (state) => (personId: number): number => {
      if (!state.currentBill) return 0

      let total = 0
      for (const lineItem of state.currentBill.line_items) {
        for (const claim of lineItem.person_claims) {
          if (claim.person_id === personId && claim.calculated_amount) {
            total += claim.calculated_amount
          }
        }
      }
      return total
    },

    isLoading: (state): boolean => {
      return state.loading
    },

    hasError: (state): boolean => {
      return state.error !== null
    },
  },

  actions: {
    async fetchBills(tabId?: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        this.bills = await api.bills.list(tabId)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch bills'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchBillById(id: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        const bill = await api.bills.get(id)
        this.currentBill = bill

        // Update the bill in the list if it exists
        const index = this.bills.findIndex((b) => b.id === id)
        if (index !== -1) {
          this.bills[index] = {
            id: bill.id,
            description: bill.description,
            currency: bill.currency,
            status: bill.status,
            date: bill.date,
            is_closed: bill.is_closed,
            total_amount: bill.total_amount,
            created_at: bill.created_at,
          }
        }

        // Initialize draft splits from current bill
        this.initializeDraftSplits(bill)

        return bill
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch bill'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createBill(data: CreateBillData) {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        const newBill = await api.bills.create(data)

        // Add to bills list
        this.bills.unshift({
          id: newBill.id,
          description: newBill.description,
          currency: newBill.currency,
          status: newBill.status,
          date: newBill.date,
          is_closed: newBill.is_closed,
          total_amount: newBill.total_amount,
          created_at: newBill.created_at,
        })

        this.currentBill = newBill
        return newBill
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create bill'
        throw error
      } finally {
        this.loading = false
      }
    },

    async submitSplits(billId: number) {
      if (!this.currentBill) {
        throw new Error('No current bill selected')
      }

      if (!this.isValidSplit) {
        throw new Error('Invalid splits: total exceeds line item value')
      }

      this.loading = true
      this.error = null

      try {
        const api = useApi()

        // Convert draft splits to API format
        const line_item_splits: LineItemSplitSubmit[] = []

        for (const lineItem of this.currentBill.line_items) {
          const splits = this.draftSplits[lineItem.id]
          if (!splits) continue

          const person_splits = Object.entries(splits)
            .filter(([_, value]) => value !== null && value > 0)
            .map(([personId, value]) => ({
              person_id: parseInt(personId),
              split_value: value,
            }))

          if (person_splits.length > 0) {
            line_item_splits.push({
              line_item_id: lineItem.id,
              person_splits,
            })
          }
        }

        const payload: SubmitSplitsData = {
          bill_id: billId,
          split_mode: this.splitMode,
          line_item_splits,
        }

        const updatedBill = await api.bills.submitSplits(billId, payload)
        this.currentBill = updatedBill

        // Update bill in list
        const index = this.bills.findIndex((b) => b.id === billId)
        if (index !== -1) {
          this.bills[index] = {
            id: updatedBill.id,
            description: updatedBill.description,
            currency: updatedBill.currency,
            status: updatedBill.status,
            date: updatedBill.date,
            is_closed: updatedBill.is_closed,
            total_amount: updatedBill.total_amount,
            created_at: updatedBill.created_at,
          }
        }

        return updatedBill
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to submit splits'
        throw error
      } finally {
        this.loading = false
      }
    },

    updateDraftSplit(lineItemId: number, personId: number, value: number | null) {
      if (!this.draftSplits[lineItemId]) {
        this.draftSplits[lineItemId] = {}
      }
      this.draftSplits[lineItemId][personId] = value
    },

    calculateEvenSplit(lineItem: LineItem, people: TabPerson[]) {
      const sharePerPerson = 1
      const totalShares = people.length

      for (const person of people) {
        const calculatedAmount = (lineItem.value * sharePerPerson) / totalShares
        this.updateDraftSplit(lineItem.id, person.id, sharePerPerson)
      }
    },

    initializeDraftSplits(bill: Bill) {
      this.draftSplits = {}

      for (const lineItem of bill.line_items) {
        this.draftSplits[lineItem.id] = {}

        for (const claim of lineItem.person_claims) {
          this.draftSplits[lineItem.id][claim.person_id] = claim.split_value
        }
      }
    },

    resetDraftSplits() {
      this.draftSplits = {}
      if (this.currentBill) {
        this.initializeDraftSplits(this.currentBill)
      }
    },

    validateSplits(): { valid: boolean; errors: string[] } {
      const errors: string[] = []

      if (!this.currentBill) {
        errors.push('No bill selected')
        return { valid: false, errors }
      }

      for (const lineItem of this.currentBill.line_items) {
        const splits = this.draftSplits[lineItem.id]
        if (!splits) continue

        const splitValues = Object.values(splits).filter((v) => v !== null) as number[]

        if (splitValues.length === 0) continue

        if (lineItem.split_type === 'value') {
          const total = splitValues.reduce((sum, val) => sum + val, 0)
          if (total > lineItem.value) {
            errors.push(
              `Line item "${lineItem.description}": split total (${total}) exceeds value (${lineItem.value})`
            )
          }
        }

        // Check for negative values
        for (const value of splitValues) {
          if (value < 0) {
            errors.push(`Line item "${lineItem.description}": negative values are not allowed`)
            break
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      }
    },

    setCurrentBill(bill: Bill | null) {
      this.currentBill = bill
      if (bill) {
        this.initializeDraftSplits(bill)
      } else {
        this.draftSplits = {}
      }
    },

    setSplitMode(mode: SplitMode) {
      this.splitMode = mode
    },

    clearError() {
      this.error = null
    },

    $reset() {
      this.bills = []
      this.currentBill = null
      this.loading = false
      this.error = null
      this.splitMode = 'even' as SplitMode
      this.draftSplits = {}
    },
  },
})
