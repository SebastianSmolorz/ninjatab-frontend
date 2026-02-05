<template>
  <UMain class="bg-gray-50 dark:bg-gray-900">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error state -->
    <UContainer v-else-if="error" class="py-8 max-w-4xl">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="soft"
        title="Error loading bill"
        :description="error"
      />
    </UContainer>

    <!-- Bill content -->
    <UContainer v-else-if="bill" class="py-8 max-w-4xl">
      <div class="space-y-6">
        <!-- Header with back button -->
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-arrow-long-left"
            variant="ghost"
            @click="router.push(`/tabs/${tabId}`)"
          >
            Back to Tab
          </UButton>
        </div>

        <!-- Bill info card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {{ bill.description }}
              </h2>
              <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>{{ formatDate(bill.date) }}</span>
                <span>•</span>
                <USelect
                  v-model="selectedCurrency"
                  :items="currencyOptions"
                  size="xs"
                  @change="updateCurrency"
                  :disabled="bill.is_closed"
                />
              </div>
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ bill.currency }} {{ bill.total_amount }}
            </div>
          </div>

          <!-- Bill metadata -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Created by</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ bill.creator.name }}</div>
            </div>
            <div v-if="bill.paid_by">
              <div class="text-sm text-gray-500 dark:text-gray-400">Paid by</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ bill.paid_by.name }}</div>
            </div>
          </div>
        </div>

        <!-- Person totals summary -->
        <div v-if="personTotals.length > 0" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending per person
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="person in personTotals"
              :key="person.person_id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <span class="font-medium text-gray-900 dark:text-white">{{ person.person_name }}</span>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ bill.currency }} {{ formatCurrencyAmount(person.total) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Line items -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Line Items & Splits
            </h3>
            <div class="flex gap-2">
              <UButton
                v-if="!editMode && !bill.is_closed"
                icon="i-heroicons-pencil"
                size="sm"
                variant="outline"
                @click="enterEditMode"
              >
                Edit Splits
              </UButton>
              <UButton
                v-if="editMode"
                variant="outline"
                size="sm"
                @click="cancelEdit"
              >
                Cancel
              </UButton>
              <UButton
                v-if="editMode"
                size="sm"
                :loading="savingsplits"
                @click="saveSplits"
              >
                Save Changes
              </UButton>
            </div>
          </div>

          <!-- Line items list -->
          <div class="space-y-6">
            <div
              v-for="(item, itemIndex) in bill.line_items"
              :key="item.id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <!-- Line item header -->
              <div class="mb-4">
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {{ item.description }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ bill.currency }} {{ item.value }}
                </p>
              </div>

              <!-- View mode: Show current splits -->
              <div v-if="!editMode">
                <div class="space-y-2">
                  <div
                    v-for="claim in item.person_claims"
                    :key="claim.id"
                    class="flex items-center justify-between text-sm"
                  >
                    <span class="text-gray-700 dark:text-gray-300">{{ claim.person_name }}</span>
                    <div class="flex items-center gap-3">
                      <span class="text-gray-500 dark:text-gray-400">
                        {{ Math.floor(claim.split_value || 0) }} {{ item.split_type === 'shares' ? 'shares' : '' }}
                      </span>
                      <span class="font-medium text-gray-900 dark:text-white w-24 text-right">
                        {{ bill.currency }} {{ (claim.calculated_amount || 0) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Edit mode: Split editing UI -->
              <div v-else>
                <!-- Split mode toggle -->
                <div class="flex gap-2 mb-4">
                  <UButton
                    :variant="splitModes[itemIndex] === 'even' ? 'solid' : 'outline'"
                    size="sm"
                    @click="setSplitMode(itemIndex, 'even')"
                  >
                    Split Evenly
                  </UButton>
                  <UButton
                    :variant="splitModes[itemIndex] === 'custom' ? 'solid' : 'outline'"
                    size="sm"
                    @click="setSplitMode(itemIndex, 'custom')"
                  >
                    Custom Split
                  </UButton>
                </div>

                <!-- Custom split mode -->
                <div v-if="splitModes[itemIndex] === 'custom'">
                  <!-- Table Header -->
                  <div class="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700 mb-3">
                    <div class="flex-1">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
                    </div>
                    <div class="w-24 text-center">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">How many</span>
                    </div>
                  </div>

                  <!-- People rows -->
                  <div class="space-y-3">
                    <div
                      v-for="person in tabStore.currentTab?.people || []"
                      :key="person.id"
                      class="flex items-start gap-3"
                    >
                      <div class="flex-1">
                        <div class="font-medium text-gray-900 dark:text-white text-sm">
                          {{ person.name }}
                        </div>
                      </div>
                      <div class="w-24">
                        <UInput
                          v-model.number="splits[itemIndex][person.id]"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          size="sm"
                          class="w-full"
                        />
                        <!-- Calculated amount display -->
                        <div class="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                          {{ calculateShareAmount(itemIndex, person.id, item.value) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Even split mode -->
                <div v-else class="text-sm text-gray-600 dark:text-gray-400">
                  Split evenly between all {{ tabStore.currentTab?.people.length || 0 }} people
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillStore } from '~/stores/bills'
import { useTabStore } from '~/stores/tabs'
import { Currency, type BillStatus } from '~/types'

const route = useRoute()
const router = useRouter()
const billStore = useBillStore()
const tabStore = useTabStore()

// State
const editMode = ref(false)
const savingsplits = ref(false)
const closingBill = ref(false)
const splitModes = ref<Record<number, 'even' | 'custom'>>({})
const splits = ref<Record<number, Record<number, number>>>({})
const selectedCurrency = ref<Currency>(Currency.GBP)

// Computed
const tabId = computed(() => parseInt(route.params.id as string))
const billId = computed(() => parseInt(route.params.billId as string))
const bill = computed(() => billStore.currentBill)
const loading = computed(() => billStore.isLoading)
const error = computed(() => billStore.error)

const currencyOptions = Object.values(Currency).map(c => ({
  label: c,
  value: c
}))

// Calculate person totals (sum of all their claims across line items)
const personTotals = computed(() => {
  if (!bill.value) return []

  const totals = new Map<number, { person_id: number, person_name: string, total: number }>()

  bill.value.line_items.forEach(lineItem => {
    lineItem.person_claims.forEach(claim => {
      const amount = Number(claim.calculated_amount) || 0
      if (totals.has(claim.person_id)) {
        totals.get(claim.person_id)!.total += amount
      } else {
        totals.set(claim.person_id, {
          person_id: claim.person_id,
          person_name: claim.person_name,
          total: amount
        })
      }
    })
  })

  return Array.from(totals.values())
    .filter(person => person.total > 0)
    .sort((a, b) => a.person_name.localeCompare(b.person_name))
})

// Watch bill changes to update selected currency
watch(bill, (newBill) => {
  if (newBill) {
    selectedCurrency.value = newBill.currency as Currency
  }
}, { immediate: true })

// Helper functions
const formatCurrencyAmount = (amount: number) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatStatus = (status: BillStatus) => {
  const statusMap: Record<BillStatus, string> = {
    'open': 'Open',
    'all_claimed': 'All Claimed',
    'all_paid': 'All Paid',
    'archived': 'Archived'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: BillStatus) => {
  const colorMap: Record<BillStatus, string> = {
    'open': 'text-yellow-600 dark:text-yellow-400',
    'all_claimed': 'text-blue-600 dark:text-blue-400',
    'all_paid': 'text-green-600 dark:text-green-400',
    'archived': 'text-gray-600 dark:text-gray-400'
  }
  return colorMap[status] || 'text-gray-600 dark:text-gray-400'
}

const formatCurrency = (amount: number) => {
  if (!bill.value) return `${amount.toFixed(2)}`
  return `${bill.value.currency} ${amount.toFixed(2)}`
}

const calculateShareAmount = (itemIndex: number, personId: number, itemValue: number): string => {
  if (!bill.value) return formatCurrency(0)
  if (!splits.value[itemIndex]) return formatCurrency(0)
  if (!(personId in splits.value[itemIndex])) return formatCurrency(0)

  // Ensure itemValue is a number
  const value = typeof itemValue === 'number' ? itemValue : parseFloat(String(itemValue)) || 0

  const personShares = Number(splits.value[itemIndex][personId]) || 0

  // Calculate total shares for this item
  const totalShares = Object.values(splits.value[itemIndex]).reduce(
    (sum, shares) => sum + (Number(shares) || 0),
    0
  )

  if (totalShares === 0 || personShares === 0) return formatCurrency(0)

  // Calculate this person's share
  const amount = (value * personShares) / totalShares

  // Ensure the result is a valid number
  if (isNaN(amount)) return formatCurrency(0)

  return formatCurrency(amount)
}

const enterEditMode = () => {
  if (!bill.value || !tabStore.currentTab) return

  // Initialize split states from current bill data
  splitModes.value = {}
  splits.value = {}

  bill.value.line_items.forEach((item, index) => {
    // Initialize splits object for ALL tab people
    splits.value[index] = {}

    // First, set all people to 0
    tabStore.currentTab.people.forEach(person => {
      splits.value[index][person.id] = 0
    })

    // Then, update with existing claim values
    item.person_claims.forEach(claim => {
      splits.value[index][claim.person_id] = Number(claim.split_value) || 0
    })

    // Determine if it's even split:
    // - All tab people must have a claim (count matches)
    // - All claims must have the same split_value (typically 1)
    const allPeopleIncluded = item.person_claims.length === tabStore.currentTab.people.length
    const splitValues = item.person_claims.map(c => Number(c.split_value) || 0)
    const allSameValue = splitValues.length > 0 && splitValues.every(v => v === splitValues[0])

    splitModes.value[index] = (allPeopleIncluded && allSameValue) ? 'even' : 'custom'
  })

  editMode.value = true
}

const cancelEdit = () => {
  editMode.value = false
  splitModes.value = {}
  splits.value = {}
}

const setSplitMode = (itemIndex: number, mode: 'even' | 'custom') => {
  if (!bill.value || !tabStore.currentTab) return

  splitModes.value[itemIndex] = mode

  // If switching to even, set all tab people's splits to 1
  if (mode === 'even') {
    tabStore.currentTab.people.forEach(person => {
      splits.value[itemIndex][person.id] = 1
    })
  } else if (mode === 'custom') {
    // When switching to custom, ensure all people have a value in splits
    // This is needed for reactivity to work properly with the input fields
    if (!splits.value[itemIndex]) {
      splits.value[itemIndex] = {}
    }
    tabStore.currentTab.people.forEach(person => {
      // Only set if not already set, to preserve existing values
      if (!(person.id in splits.value[itemIndex])) {
        splits.value[itemIndex][person.id] = 0
      }
    })
  }
}

const saveSplits = async () => {
  if (!bill.value || !tabStore.currentTab) return

  savingsplits.value = true

  try {
    // Clear existing draft splits to ensure fresh state
    billStore.draftSplits = {}

    // Update draft splits in store for ALL tab people
    bill.value.line_items.forEach((item, itemIndex) => {
      tabStore.currentTab!.people.forEach(person => {
        // Get split value, ensure it's a number and handle empty strings
        let splitValue = splits.value[itemIndex]?.[person.id]

        // Convert to number and handle various input states
        if (splitValue === '' || splitValue === null || splitValue === undefined) {
          splitValue = 0
        } else {
          splitValue = Number(splitValue)
        }

        // Include ALL people in draftSplits with their actual values (including 0)
        // The backend deletes all old claims and creates new ones from the payload
        // 0 means "remove from split" - if we don't include it, old claim persists
        billStore.updateDraftSplit(item.id, person.id, splitValue)
      })
    })

    // Submit splits to backend
    await billStore.submitSplits(billId.value)

    // Refresh bill data
    await billStore.fetchBillById(billId.value)

    editMode.value = false
  } catch (error) {
    console.error('Failed to save splits:', error)
    // TODO: Show error notification
  } finally {
    savingsplits.value = false
  }
}

const updateCurrency = async () => {
  if (!bill.value || selectedCurrency.value === bill.value.currency) return

  try {
    const api = useApi()
    await api.bills.update(billId.value, { currency: selectedCurrency.value })
    await billStore.fetchBillById(billId.value)
  } catch (error) {
    console.error('Failed to update currency:', error)
    // Revert on error
    if (bill.value) {
      selectedCurrency.value = bill.value.currency as Currency
    }
  }
}

const closeBill = async () => {
  if (!bill.value) return

  closingBill.value = true
  try {
    const api = useApi()
    await api.bills.close(billId.value)
    await billStore.fetchBillById(billId.value)
  } catch (error) {
    console.error('Failed to close bill:', error)
    // TODO: Show error notification
  } finally {
    closingBill.value = false
  }
}

// Load bill on mount
onMounted(async () => {
  try {
    await billStore.fetchBillById(billId.value)

    // Also load tab data if not already loaded
    if (!tabStore.currentTab || tabStore.currentTab.id !== tabId.value) {
      await tabStore.fetchTabById(tabId.value)
    }
  } catch (error) {
    console.error('Failed to load bill:', error)
  }
})
</script>
