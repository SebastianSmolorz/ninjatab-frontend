<template>
  <UMain class="bg-gray-50 dark:bg-gray-900">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error state -->
    <UContainer v-else-if="error" class="py-8">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        variant="soft"
        title="Error loading tab"
        :description="error"
      />
    </UContainer>

    <!-- Tab content -->
    <UContainer v-else-if="tab" class="py-8">
      <div class="space-y-6">
      <!-- Tab Info Card -->
      <div class="relative cursor-pointer" @click="handleCardClick">
        <UCard variant="solid">
          <!-- Always visible header -->
          <div class="flex items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ tab.name }}
              </h1>
              <UBadge
                :color="tab.is_settled ? 'neutral' : 'success'"
                variant="subtle"
                size="lg"
                class="mt-2 mb-2"
              >
                {{ tab.is_settled ? 'Settled' : 'Open' }}
              </UBadge>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ tab.people?.length || 0 }} {{ tab.people?.length === 1 ? 'person' : 'people' }}
              </p>
              <p v-if="tab.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ tab.description }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <USelect
                v-model="selectedAction"
                :items="tabActions"
                placeholder="Actions"
                size="xl"
                @update:model-value="handleActionSelect"
                @click.stop
              >
              </USelect>
            </div>
          </div>

          <!-- Collapsible details -->
          <div v-if="tabDetailsOpen" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
          <!-- Settlement Currency -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Settlement Currency:</span>
            <USelect
              v-model="selectedCurrency"
              :items="currencyOptions"
              size="sm"
              @click.stop
              @update:model-value="updateSettlementCurrency"
            />
          </div>

          <!-- People & Spending -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">People & Spending</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                v-for="person in tab.people"
                :key="person.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">
                      {{ person.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ person.name }}
                    </div>
                    <div v-if="person.email" class="text-sm text-gray-500 dark:text-gray-400">
                      {{ person.email }}
                    </div>
                  </div>
                </div>
                <div v-if="getPersonTotal(person.id)" class="text-right">
                  <div class="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {{ tab.settlement_currency }} {{ formatCurrencyAmount(getPersonTotal(person.id)) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Total spent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </UCard>

        <!-- Pull tab with chevron -->
        <div class="flex justify-center">
          <div
            class="bg-white dark:bg-gray-800 px-6 py-1.5 rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-primary select-none touch-none"
            @mousedown="startDrag"
            @touchstart="startDrag"
          >
            <UIcon
              :name="tabDetailsOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              class="w-5 h-5 text-primary transition-transform duration-200"
              :class="{ 'translate-y-0.5': isDragging }"
            />
          </div>
        </div>
      </div>

      <!-- Settlement section (combines total spent and settlements) -->
      <UCard variant="solid" v-if="tab.settlements && tab.settlements.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white pb-4">
            Simplified Settlement
          </h3>

        <div class="space-y-4">
          <!-- Total Spent -->
          <div class="grid grid-cols-3 md:grid-cols-4 gap-2">
            <div
              v-if="totalSpentInSettlement !== null"
              class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Total group spend ({{ tab.settlement_currency }})
              </div>
              <div class="text-lg font-bold text-green-700 dark:text-green-400">
                {{ formatCurrencyAmount(totalSpentInSettlement) }}
              </div>
            </div>
            <div
              v-for="(total, currency) in totalSpentByCurrency"
              :key="currency"
              class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ currency }} spent
              </div>
              <div class="text-lg font-bold text-blue-700 dark:text-blue-400">
                {{ formatCurrencyAmount(total) }}
              </div>
            </div>
          </div>

          <!-- Settlements -->
          <div class="space-y-2">
            <div
              v-for="settlement in tab.settlements"
              :key="settlement.id"
              class="flex items-center justify-between p-2 rounded-lg border"
              :class="settlement.paid ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-green-50 dark:bg-blue-900/20 border-green-200 dark:border-green-800'"
            >
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-semibold text-primary-700 dark:text-primary-300">
                    {{ settlement.from_person.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="font-medium text-gray-900 dark:text-white text-sm">
                  {{ settlement.from_person.name }}
                </span>
                <span class="text-sm text-gray-500">pays</span>
                <span class="font-bold" :class="settlement.paid ? 'text-gray-500 line-through' : 'text-green-700 dark:text-green-400'">
                  {{ settlement.currency }} {{ settlement.amount }}
                </span>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-gray-400" />
                <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-semibold text-primary-700 dark:text-primary-300">
                    {{ settlement.to_person.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="font-medium text-gray-900 dark:text-white text-sm">
                  {{ settlement.to_person.name }}
                </span>
              </div>
              <UButton
                v-if="!settlement.paid"
                size="xs"
                variant="soft"
                color="success"
                @click="markSettlementPaid(settlement.id)"
              >
                Mark as paid
              </UButton>
              <UBadge v-else color="neutral" variant="subtle">
                Paid
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Bills section -->
      <UCard variant="solid">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Bills
              </h3>
              <UBadge color="gray" variant="subtle">
                {{ bills?.length || 0 }}
              </UBadge>
            </div>
            <UButton
              v-if="!tab.is_settled"
              icon="i-heroicons-plus"
              size="sm"
              @click="router.push(`/tabs/${tab.id}/bills/create`)"
            >
              Add Bill
            </UButton>
          </div>
        </template>

        <!-- Bills list -->
        <div v-if="bills && bills.length > 0" class="space-y-3">
          <div
            v-for="bill in bills"
            :key="bill.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 cursor-pointer" @click="router.push(`/tabs/${tab.id}/bills/${bill.id}`)">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ bill.description }}
                </h4>
                <div class="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span v-if="bill.date">{{ formatDate(bill.date) }}</span>
                  <span v-if="bill.paid_by">•</span>
                  <span v-if="bill.paid_by" class="text-primary-600 dark:text-primary-400">
                    Paid by {{ bill.paid_by.name }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ bill.currency }} {{ (bill.total_amount || 0) }}
                </div>
                <UButton
                  v-if="!tab.is_settled"
                  icon="i-heroicons-trash"
                  variant="ghost"
                  size="sm"
                  @click.stop="confirmDeleteBill(bill.id)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col gap-7 text-center py-8 text-gray-500 dark:text-gray-400">
          <div>
            No bills yet. Add your first expense to get started.
          </div>
          <div>
            <UButton
                v-if="!tab.is_settled"
                icon="i-heroicons-plus"
                size="xl"
                class="text-black"
                @click="router.push(`/tabs/${tab.id}/bills/create`)"
            >
              Add your first bill
            </UButton>
          </div>
        </div>
      </UCard>
      </div>
    </UContainer>

    <!-- Delete Bill Modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delete Bill
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this bill? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showDeleteModal = false"
            />
            <UButton
              label="Delete"
              @click="deleteBill"
              :loading="deletingBill"
            />
          </div>
        </div>
      </template>
    </UModal>
  </UMain>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'
import { useBillStore } from '~/stores/bills'
import type { PersonSpendingTotal, Currency } from '~/types'

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()
const billStore = useBillStore()
const api = useApi()

// State
const simplifyingTab = ref(false)
const personSpendingTotals = ref<PersonSpendingTotal[]>([])
const showDeleteModal = ref(false)
const billToDelete = ref<number | null>(null)
const deletingBill = ref(false)
const selectedAction = ref<string>('')
const tabDetailsOpen = ref(false)

// Drag state
const isDragging = ref(false)
const dragStartY = ref(0)
const dragThreshold = 30 // pixels needed to trigger toggle

// Currency dropdown
const selectedCurrency = ref<Currency>()
const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'JPY', value: 'JPY' },
  { label: 'CAD', value: 'CAD' },
  { label: 'TRY', value: 'TRY' },
]

// Computed
const tab = computed(() => tabStore.currentTab)

// Actions dropdown
const tabActions = computed(() => {
  const actions = []
  if (!tab.value?.is_settled) {
    actions.push({ label: 'Settle up', value: 'settle' })
  }
  actions.push({ label: 'Archive', value: 'archive' })
  actions.push({ label: 'Delete', value: 'delete' })
  return actions
})
const loading = computed(() => tabStore.isLoading)
const error = computed(() => tabStore.error)
const bills = computed(() => billStore.bills)

// Calculate total spent per currency
const totalSpentByCurrency = computed(() => {
  if (!bills.value) return {}

  const totals: Record<string, number> = {}

  bills.value.forEach(bill => {
    const currency = bill.currency
    const amount = Number(bill.total_amount) || 0

    if (!totals[currency]) {
      totals[currency] = 0
    }
    totals[currency] += amount
  })

  return totals
})

// Get total spent in settlement currency from backend
const totalSpentInSettlement = computed(() => {
  if (!tab.value?.total_spent_gbp) return null
  return Number(tab.value.total_spent_gbp)
})

// Helper functions
const formatCurrencyAmount = (amount: number) => {
  return amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getPersonTotal = (personId: number): number => {
  const personTotal = personSpendingTotals.value.find(p => p.person_id === personId)
  return personTotal ? Number(personTotal.total) : 0
}

const updateSettlementCurrency = async (currency: Currency) => {
  if (!tab.value) return

  try {
    await api.tabs.update(tab.value.id, { settlement_currency: currency })
    await tabStore.fetchTabById(tab.value.id)
    // Refresh person totals as they're calculated in the new currency
    personSpendingTotals.value = await api.tabs.personTotals(tab.value.id)
  } catch (error) {
    console.error('Failed to update settlement currency:', error)
  }
}

const settleTab = async () => {
  if (!tab.value) return

  simplifyingTab.value = true
  try {
    // First close the tab
    await api.tabs.close(tab.value.id)
    // Then simplify it
    await api.tabs.simplify(tab.value.id)
    // Refresh the tab to get the settlements
    await tabStore.fetchTabById(tab.value.id)
    // Navigate to the celebration screen
    router.push(`/tabs/${tab.value.id}/settled`)
  } catch (error) {
    console.error('Failed to settle tab:', error)
  } finally {
    simplifyingTab.value = false
  }
}

const handleActionSelect = async (action: string) => {
  if (action === 'settle') {
    await settleTab()
  } else if (action === 'archive') {
    await archiveTab()
  }
  selectedAction.value = ''
}

const archiveTab = async () => {
  if (!tab.value) return

  try {
    await api.tabs.close(tab.value.id)
    await tabStore.fetchTabById(tab.value.id)
  } catch (error) {
    console.error('Failed to archive tab:', error)
  }
}

const markSettlementPaid = async (settlementId: number) => {
  if (!tab.value) return

  try {
    await api.tabs.markSettlementPaid(settlementId)
    await tabStore.fetchTabById(tab.value.id)
  } catch (error) {
    console.error('Failed to mark settlement as paid:', error)
  }
}

const confirmDeleteBill = (billId: number) => {
  billToDelete.value = billId
  showDeleteModal.value = true
}

const deleteBill = async () => {
  if (!billToDelete.value || !tab.value) return

  deletingBill.value = true
  try {
    await api.bills.delete(billToDelete.value)
    await billStore.fetchBills(tab.value.id)
    showDeleteModal.value = false
    billToDelete.value = null
  } catch (error) {
    console.error('Failed to delete bill:', error)
  } finally {
    deletingBill.value = false
  }
}

const handleCardClick = () => {
  tabDetailsOpen.value = !tabDetailsOpen.value
}

// Drag handling for pull tab
const getClientY = (e: MouseEvent | TouchEvent): number => {
  if ('touches' in e) {
    return e.touches[0].clientY
  }
  return e.clientY
}

const startDrag = (e: MouseEvent | TouchEvent) => {
  e.stopPropagation()
  isDragging.value = true
  dragStartY.value = getClientY(e)

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
}

const endDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  const endY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY
  const deltaY = endY - dragStartY.value

  // Drag down to expand (when collapsed), drag up to collapse (when expanded)
  if (!tabDetailsOpen.value && deltaY > dragThreshold) {
    tabDetailsOpen.value = true
  } else if (tabDetailsOpen.value && deltaY < -dragThreshold) {
    tabDetailsOpen.value = false
  }

  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
}

// Load tab and bills on mount
onMounted(async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/')
    return
  }

  try {
    await tabStore.fetchTabById(id)
    await billStore.fetchBills(id)

    // Set initial currency
    if (tab.value) {
      selectedCurrency.value = tab.value.settlement_currency
    }

    // Fetch person spending totals
    personSpendingTotals.value = await api.tabs.personTotals(id)
  } catch (error) {
    console.error('Failed to load tab or bills:', error)
  }
})

// Cleanup event listeners on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
})
</script>
