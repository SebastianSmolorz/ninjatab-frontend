<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-8">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="soft"
        title="Error loading bill"
        :description="error"
      />
    </div>

    <!-- Bill content -->
    <div v-else-if="bill" class="max-w-4xl mx-auto px-4 py-8">
      <div class="space-y-6">
        <!-- Header with back button -->
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-arrow-left"
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
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ bill.currency }} {{ bill.total_amount }}
              </div>
              <div v-if="bill.is_closed" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Closed
              </div>
              <div v-else class="text-sm text-green-600 dark:text-green-400 mt-1">
                Open
              </div>
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
                      v-for="claim in item.person_claims"
                      :key="claim.id"
                      class="flex items-start gap-3"
                    >
                      <div class="flex-1">
                        <div class="font-medium text-gray-900 dark:text-white text-sm">
                          {{ claim.person_name }}
                        </div>
                      </div>
                      <div class="w-24">
                        <UInput
                          v-model.number="splits[itemIndex][claim.person_id]"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          size="sm"
                          class="w-full"
                        />
                        <!-- Calculated amount display -->
                        <div class="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                          {{ calculateShareAmount(itemIndex, claim.person_id, item.value) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Even split mode -->
                <div v-else class="text-sm text-gray-600 dark:text-gray-400">
                  Split evenly between all {{ item.person_claims.length }} people
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="!bill.is_closed" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actions
          </h3>
          <UButton
            variant="outline"
            @click="closeBill"
            :loading="closingBill"
          >
            Close Bill
          </UButton>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Once closed, splits cannot be edited.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillStore } from '~/stores/bills'
import { useTabStore } from '~/stores/tabs'
import type { BillStatus } from '~/types'

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

// Computed
const tabId = computed(() => parseInt(route.params.id as string))
const billId = computed(() => parseInt(route.params.billId as string))
const bill = computed(() => billStore.currentBill)
const loading = computed(() => billStore.isLoading)
const error = computed(() => billStore.error)

// Helper functions
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
  if (!bill.value) return

  // Initialize split states from current bill data
  splitModes.value = {}
  splits.value = {}

  bill.value.line_items.forEach((item, index) => {
    // Determine if it's even split (all have same split_value)
    const splitValues = item.person_claims.map(c => Number(c.split_value) || 0)
    const isEven = splitValues.every(v => v === splitValues[0])

    splitModes.value[index] = isEven ? 'even' : 'custom'

    // Initialize splits object
    splits.value[index] = {}
    item.person_claims.forEach(claim => {
      splits.value[index][claim.person_id] = Number(claim.split_value) || 0
    })
  })

  editMode.value = true
}

const cancelEdit = () => {
  editMode.value = false
  splitModes.value = {}
  splits.value = {}
}

const setSplitMode = (itemIndex: number, mode: 'even' | 'custom') => {
  if (!bill.value) return

  splitModes.value[itemIndex] = mode

  // If switching to even, set all splits to 1
  if (mode === 'even') {
    const item = bill.value.line_items[itemIndex]
    item.person_claims.forEach(claim => {
      splits.value[itemIndex][claim.person_id] = 1
    })
  }
}

const saveSplits = async () => {
  if (!bill.value) return

  savingsplits.value = true

  try {
    // Update draft splits in store
    bill.value.line_items.forEach((item, itemIndex) => {
      item.person_claims.forEach(claim => {
        const splitValue = splits.value[itemIndex][claim.person_id] || 0
        billStore.updateDraftSplit(item.id, claim.person_id, splitValue)
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
