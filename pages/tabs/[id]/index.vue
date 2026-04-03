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
      <div class="relative">
        <UCard variant="solid" :class="tab.is_pro ? 'ring-2 ring-orange-400' : ''">
          <!-- Always visible header -->
          <div class="flex items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ tab.name }}
              </h1>
              <div class="flex items-center gap-2 mt-2 mb-2">
                <UBadge
                  :color="tab.is_settled ? 'neutral' : 'success'"
                  variant="subtle"
                  size="lg"
                >
                  {{ tab.is_settled ? 'Settled' : 'Open' }}
                </UBadge>
                <UBadge
                  v-if="tab.is_pro"
                  variant="subtle"
                  size="lg"
                  class="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                >
                  Pro
                </UBadge>
              </div>
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
                size="lg"
                class="w-34"
                @update:model-value="handleActionSelect"
                @click.stop
              >
              </USelect>
            </div>
          </div>

          <!-- Collapsible details -->
          <div v-if="tabDetailsOpen" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <!-- Settlement Currency -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Settlement Currency:</span>
            <CurrencySelect
              v-model="selectedCurrency"
              size="sm"
              v-if="!tab.is_settled"
              @click.stop
              @update:model-value="updateSettlementCurrency"
            />
            <p v-else>
              {{ selectedCurrency }} ({{ getCurrencySymbol(selectedCurrency) }})
            </p>
          </div>

          <!-- People & Spending -->
          <div>
            <div class="flex items-baseline justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">People & Spending</h3>
              <div class="flex gap-2">
                <UButton
                  v-if="!tab.is_settled"
                  icon="i-lucide-user-plus"
                  size="lg"
                  variant="outline"
                  @click="openAddPersonModal"
                >
                  Add person
                </UButton>
                <UButton
                  v-if="!tab.is_settled"
                  icon="i-lucide-clipboard-copy"
                  size="lg"
                  @click="handleActionSelect('copy-invite')"
                >
                  Copy join link
                </UButton>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                v-for="person in tabPeople"
                :key="person.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                      class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0"
                      :class="{'dark:bg-primary-800': person?.user, 'dark:bg-gray-700': !person?.user}"
                  >
                    <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">
                      {{ person.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ person.name }}
                    </div>
                    <div v-if="person?.user?.email" class="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {{ person.user.email }}
                    </div>
                    <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                      Not joined
                    </div>
                  </div>
                </div>
                <div v-if="getPersonTotal(person.id)" class="text-right">
                  <div class="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {{ getCurrencySymbol(tab.settlement_currency) }}{{ formatCurrencyAmount(getPersonTotal(person.id)) }}
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
        <div class="flex justify-center cursor-pointer" @click="handleCardClick">
          <div
            class="bg-white dark:bg-gray-800 px-6 py-1.5 rounded-b-lg shadow-sm border border-t-0 select-none touch-none"
            :class="tab.is_pro ? 'border-orange-400' : 'border-gray-200 dark:border-primary'"
            @mousedown="startDrag"
            @touchstart="startDrag"
          >
            <UIcon
              :name="tabDetailsOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="w-5 h-5 transition-transform duration-200"
              :class="[tab.is_pro ? 'text-orange-400' : 'text-primary', { 'translate-y-0.5': isDragging }]"
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
                Total group spend ({{ getCurrencySymbol(tab.settlement_currency) }})
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
                {{ getCurrencySymbol(currency) }} spent
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
                  {{ getCurrencySymbol(settlement.currency) }}{{ settlement.amount }}
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
                {{ tab.bill_count }}
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
                  {{ getCurrencySymbol(bill.currency) }}{{ (bill.total_amount || 0) }}
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

        <div v-if="billStore.nextCursor" class="flex justify-center pt-4">
          <UButton
            :loading="billStore.loadingMore"
            @click="billStore.fetchMoreBills(tab.id)"
          >
            Load more
          </UButton>
        </div>

        <!-- Empty state -->
        <div v-else-if="!bills || bills.length === 0" class="flex flex-col gap-7 text-center py-8 text-gray-500 dark:text-gray-400">
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

    <!-- Settle Up Confirmation Modal -->
    <UModal v-model:open="showSettleModal" title="Heads up, you're about to settle">
      <template #content>
        <div class="p-4">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
            What will happen now
          </h3>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400 text-sm list-disc list-inside mb-6">
            <li>You'll see exactly who owes how much to whom</li>
            <li>You won't be able to add any more people to the tab</li>
            <li>You won't be able to add any more bills</li>
          </ul>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showSettleModal = false; selectedAction = ''"
            />
            <UButton
              label="Settle up"
              :loading="simplifyingTab"
              @click="showSettleModal = false; settleTab()"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Archive Tab Confirmation Modal -->
    <UModal v-model:open="showArchiveModal" title="Heads up, you're about to archive">
      <template #content>
        <div class="p-4">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
            What will happen now
          </h3>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400 text-sm list-disc list-inside mb-6">
            <li>It will move to your archive tabs.</li>
            <li>The tab will be closed and no longer active</li>
            <li>You won't be able to add any more bills</li>
          </ul>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showArchiveModal = false; selectedAction = ''"
            />
            <UButton
              label="Archive"
              @click="showArchiveModal = false; archiveTab()"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Add Person Modal -->
    <UModal v-model:open="showAddPersonModal">
      <template #content>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <PersonSelectMenu
              :model-value="newPersonName ? { label: newPersonName, user_id: newPersonUserId } : null"
              :contacts="contacts"
              :loading="loadingContacts"
              size="lg"
              @update:model-value="onAddPersonSelected"
            />
          </div>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showAddPersonModal = false; newPersonName = ''; newPersonUserId = undefined"
            />
            <UButton
              label="Add"
              :disabled="!newPersonName.trim()"
              :loading="addingPerson"
              @click="addPerson"
            />
          </div>
        </div>
      </template>
    </UModal>

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
import type { PersonSpendingTotal, Currency, Contact } from '~/types'

definePageMeta({ middleware: 'auth' })

const toast = useToast()

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()
const billStore = useBillStore()
const api = useApi()

// State
const simplifyingTab = ref(false)
const personSpendingTotals = ref<PersonSpendingTotal[]>([])
const showDeleteModal = ref(false)
const showSettleModal = ref(false)
const showArchiveModal = ref(false)
const showAddPersonModal = ref(false)
const newPersonName = ref('')
const newPersonUserId = ref<string | undefined>(undefined)
const addingPerson = ref(false)
const contacts = ref<Contact[]>([])
const loadingContacts = ref(false)
const billToDelete = ref<string | null>(null)
const deletingBill = ref(false)
const selectedAction = ref<string>('')
const tabDetailsOpen = ref(false)

// Drag state
const isDragging = ref(false)
const dragStartY = ref(0)
const dragThreshold = 30 // pixels needed to trigger toggle

// Currency dropdown
const selectedCurrency = ref<Currency>()

// Computed
const tab = computed(() => tabStore.currentTab)

// Actions dropdown
const tabActions = computed(() => {
  const actions = []
  if (!tab.value?.is_settled) {
    actions.push({ label: 'Settle up', value: 'settle' })
    actions.push({ label: 'Copy join link', value: 'copy-invite' })
  }
  if (!tab.value?.is_pro) {
    actions.push({ label: 'Upgrade to Pro', value: 'upgrade' })
  }
  actions.push({ label: 'Archive', value: 'archive' })
  // actions.push({ label: 'Delete', value: 'delete' })
  return actions
})
const loading = computed(() => tabStore.isLoading)
const error = computed(() => tabStore.error)
const bills = computed(() => billStore.bills)

// Total spent per currency from backend
const totalSpentByCurrency = computed(() => {
  return tab.value?.totals_by_currency ?? {}
})

// Group spend in settlement currency from backend
const totalSpentInSettlement = computed(() => {
  if (tab.value?.is_settled && tab.value?.settlement_currency_settled_total != null) {
    return Number(tab.value.settlement_currency_settled_total)
  }
  if (tab.value?.group_spend != null) {
    return Number(tab.value.group_spend)
  }
  return null
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

const getPersonTotal = (personId: string): number => {
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

  if (!bills.value || bills.value.length === 0) {
    toast.add({ title: 'Add some bills before settling up', icon: 'i-lucide-alert-circle' })
    return
  }

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
    showSettleModal.value = true
  } else if (action === 'archive') {
    showArchiveModal.value = true
  } else if (action === 'copy-invite') {
    const url = `${window.location.origin}/invite/${tab.value?.invite_code}`
    const ok = await copyToClipboard(url)
    toast.add({ title: ok ? 'Invite link copied!' : 'Could not copy link', icon: 'i-lucide-link' })
  } else if (action === 'upgrade') {
    router.push(`/tabs/${tab.value?.id}/upgrade`)
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

const markSettlementPaid = async (settlementId: string) => {
  if (!tab.value) return

  try {
    await api.tabs.markSettlementPaid(settlementId)
    await tabStore.fetchTabById(tab.value.id)
  } catch (error) {
    console.error('Failed to mark settlement as paid:', error)
  }
}

const openAddPersonModal = async () => {
  showAddPersonModal.value = true
  loadingContacts.value = true
  try {
    contacts.value = await api.tabs.contacts(tab.value?.id)
  } catch {
    contacts.value = []
  } finally {
    loadingContacts.value = false
  }
}

const onAddPersonSelected = (item: { label: string; user_id?: string }) => {
  newPersonName.value = item.label
  newPersonUserId.value = item.user_id
}

const addPerson = async () => {
  if (!newPersonName.value.trim() || !tab.value) return

  addingPerson.value = true
  try {
    await api.tabs.addPerson(tab.value.id, {
      name: newPersonName.value.trim(),
      ...(newPersonUserId.value ? { user_id: newPersonUserId.value } : {}),
    })
    await tabStore.fetchTabById(tab.value.id)
    showAddPersonModal.value = false
    newPersonName.value = ''
    newPersonUserId.value = undefined
  } catch (error) {
    console.error('Failed to add person:', error)
  } finally {
    addingPerson.value = false
  }
}

const confirmDeleteBill = (billId: string) => {
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

const tabPeople = computed(() => {
  if (tab.value && tab.value.people) {
    return [...tab.value.people].sort((a, b) => a.id.localeCompare(b.id)).sort((a, b) => a?.user ? -1 : 1)
  }
  return []
})

// Load tab and bills on mount
onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
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
