<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-2xl mx-auto px-4 py-3">
        <div class="flex items-center gap-2">
          <div
            :class="[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              step >= 0 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          ></div>
          <div
            :class="[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              step >= 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          ></div>
          <div
            :class="[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              step >= 2 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          ></div>
        </div>
      </div>
    </div>

    <!-- Form container -->
    <div class="flex-1 overflow-y-auto">
      <!-- Step 0: Choose Bill Type -->
      <UContainer v-if="step === 0" class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              What are we splitting?
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
            </p>
          </div>

          <div class="grid gap-4">
            <div
              @click="selectBillType('single')"
              class="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:border-primary-500 transition-colors"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-receipt-percent" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                    Single Expense
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    One total to split e.g. plane tickets
                  </p>
                </div>
              </div>
            </div>

            <div
              @click="selectBillType('itemised')"
              class="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:border-primary-500 transition-colors"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                    Itemised Bill
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Multiple items e.g. a restaurant receipt
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4">
            <UButton
              @click="router.push(`/tabs/${tabId}`)"
              variant="ghost"
              icon="i-heroicons-arrow-long-left"
            >
              Back to Tab
            </UButton>
          </div>
        </div>
      </UContainer>

      <!-- Step 1: Expenses & Details -->
      <UContainer v-if="step === 1" class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {{ billType === 'single' ? 'Adding Expense' : 'Adding itemised bill' }}
            </h2>
            <p v-if="billType !== 'single'" class="text-gray-600 dark:text-gray-400">
              Enter item totals, not per unit price. £15 for 3 beers, not £5 each.
            </p>
          </div>

          <!-- Bill Name (only for itemised), Who Paid, and Currency -->
          <div class="flex gap-4">
            <div v-if="billType === 'itemised'" class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bill Name <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="formData.description"
                placeholder="e.g., Dinner at Restaurant"
                class="w-full"
                size="lg"
              />
            </div>
            <div :class="['flex flex-col flex-shrink-0', billType === 'itemised' && 'items-end']">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 w-auto">
                Who Paid? <span class="text-red-500">*</span>
              </label>
              <USelect
                v-model="formData.paid_by_id"
                :items="peopleOptions"
                size="lg"
                placeholder="Select"
              />
            </div>
            <div v-if="billType === 'single'" class="flex-1"></div>
            <div class="flex flex-col items-end flex-shrink-0">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 w-auto">
                Currency <span class="text-red-500">*</span>
              </label>
              <USelect
                v-model="formData.currency"
                :items="currencyOptions"
                size="lg"
              />
            </div>
          </div>

          <!-- Single Expense Form (no Add button needed) -->
          <div v-if="billType === 'single'" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex gap-3 items-end">
              <div class="flex-1 min-w-0">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <UInput
                  v-model="singleExpense.description"
                  placeholder="e.g., Dinner, Groceries"
                  size="lg"
                  class="w-full"
                />
              </div>
              <div class="w-32 flex-shrink-0">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total
                </label>
                <UInput
                  v-model.number="singleExpense.value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  size="lg"
                />
              </div>
            </div>
          </div>

          <!-- Itemised Bill - Add Line Item Form -->
          <div v-if="billType === 'itemised'" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex gap-3 items-end">
              <div class="flex-1 min-w-0">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name
                </label>
                <UInput
                  v-model="newLineItem.description"
                  placeholder="e.g., Pizza, Coffee"
                  size="lg"
                  class="w-full"
                  @keyup.enter="addLineItem"
                />
              </div>
              <div class="w-32 flex-shrink-0">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total
                </label>
                <UInput
                  v-model.number="newLineItem.value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  size="lg"
                  @keyup.enter="addLineItem"
                />
              </div>
              <UButton
                @click="addLineItem"
                icon="i-heroicons-plus"
                class="flex-shrink-0"
                size="lg"
              >
                Add
              </UButton>
            </div>
          </div>

          <!-- Line Items List - Receipt Style (only for itemised bills) -->
          <div v-if="billType === 'itemised' && formData.line_items.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <!-- Receipt header -->
            <div class="border-b-2 border-dashed border-gray-300 px-5 py-3 text-center">
              <div class="text-xs text-gray-500 uppercase tracking-widest">Receipt</div>
            </div>

            <!-- Receipt items -->
            <div class="px-5 py-3 font-mono text-sm">
              <div
                v-for="(item, index) in formData.line_items"
                :key="index"
                class="group flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded"
              >
                <div class="flex-1 min-w-0 flex items-baseline">
                  <span class="text-black truncate">{{ item.description }}</span>
                  <span class="flex-1 mx-2 border-b border-dotted border-gray-300"></span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-black font-medium whitespace-nowrap">{{ formatCurrency(item.value) }}</span>
                  <UButton
                    @click="removeLineItem(index)"
                    variant="ghost"
                    color="error"
                    icon="i-heroicons-x-mark"
                    size="xs"
                  />
                </div>
              </div>
            </div>

            <!-- Receipt total -->
            <div class="border-t-2 border-dashed border-gray-300 px-5 py-3 font-mono">
              <div class="flex items-center justify-between">
                <span class="text-black font-bold uppercase text-sm">Total</span>
                <span class="text-lg font-bold text-black">
                  {{ formatCurrency(totalAmount) }}
                </span>
              </div>
            </div>

            <!-- Receipt footer -->
            <div class="bg-gray-50 px-5 py-2 text-center">
              <div class="text-xs text-gray-500">{{ lineItemsCount }} {{ lineItemsCount === 1 ? 'item' : 'items' }}</div>
            </div>
          </div>

          <!-- Validation Alerts (only for itemised bills) -->
          <UAlert
            v-if="billType === 'itemised' && showValidationError"
            icon="i-heroicons-exclamation-triangle"
            type="red"
            variant="soft"
            title="No items added"
            description="Please add at least one item to continue"
          />

          <UAlert
            v-if="billType === 'itemised' && showBillNameError"
            icon="i-heroicons-exclamation-triangle"
            type="danger"
            variant="soft"
            title="Bill name required"
            description="Please enter a name for your bill"
          />
        </div>
      </UContainer>

      <!-- Step 2: Split Expenses -->
      <UContainer v-if="step === 2" class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              How are we splitting this?
            </h2>
          </div>

          <!-- Line Items with Splits -->
          <div class="space-y-6">
            <div
              v-for="(item, itemIndex) in formData.line_items"
              :key="itemIndex"
              class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <!-- Line Item Header -->
              <div class="mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ item.description }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatCurrency(item.value) }}
                </p>
              </div>

              <!-- Split Mode Buttons -->
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

              <!-- Custom Split - People List -->
              <div v-if="splitModes[itemIndex] === 'custom'">
                <!-- Table Header -->
                <div class="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700 mb-3">
                  <div class="flex-1">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
                  </div>
                  <div class="w-24 text-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Shares</span>
                  </div>
                </div>

                <!-- People Rows -->
                <div class="space-y-3">
                  <div
                    v-for="person in tab?.people"
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
                      <!-- Calculated Amount Display -->
                      <div class="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        {{ calculateShareAmount(itemIndex, person.id) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Even Split - Show who's included -->
              <div v-else class="text-sm text-gray-600 dark:text-gray-400">
                Split evenly between all {{ tab?.people.length }} people
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Footer actions - Fixed at bottom -->
    <div v-if="step > 0" class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
      <UContainer class="py-4 max-w-2xl">
        <div class="flex gap-3">
          <UButton
            @click="previousStep"
            variant="outline"
            size="lg"
            class="flex-1"
          >
            Back
          </UButton>
          <UButton
            v-if="step === 1"
            @click="nextStep"
            :disabled="!canProceedToStep2"
            size="lg"
            class="flex-1"
          >
            Continue
          </UButton>
          <UButton
            v-if="step === 2"
            @click="createBill"
            :loading="loading"
            size="lg"
            class="flex-1"
          >
            Create Bill
          </UButton>
        </div>
      </UContainer>
    </div>
  </UMain>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillStore } from '~/stores/bills'
import { useTabStore } from '~/stores/tabs'
import { Currency, SplitType, type LineItemCreate, type PersonSplitCreate } from '~/types'

const route = useRoute()
const router = useRouter()
const billStore = useBillStore()
const tabStore = useTabStore()

// State
const step = ref(0)
const loading = ref(false)
const showValidationError = ref(false)
const showBillNameError = ref(false)
const billType = ref<'single' | 'itemised' | null>(null)

const formData = ref({
  description: '',
  currency: Currency.GBP,
  paid_by_id: null as number | null,
  line_items: [] as Array<{ description: string; value: number }>
})

const newLineItem = ref({
  description: '',
  value: 0
})

// Single expense state (used directly without Add button)
const singleExpense = ref({
  description: '',
  value: 0
})

// Split state: splitModes[itemIndex] = 'even' | 'custom'
const splitModes = ref<Record<number, 'even' | 'custom'>>({})

// Split values: splits[itemIndex][personId] = shareValue
const splits = ref<Record<number, Record<number, number>>>({})

// Currency options
const currencyOptions = Object.values(Currency).map(c => ({
  label: c,
  value: c
}))

// Computed
const tabId = computed(() => parseInt(route.params.id as string))

const tab = computed(() => tabStore.currentTab)

const peopleOptions = computed(() => {
  if (!tab.value?.people) return []
  return tab.value.people.map(person => ({
    label: person.name,
    value: person.id
  }))
})

const canProceedToStep2 = computed(() => {
  const hasBasicFields = formData.value.currency && formData.value.paid_by_id !== null

  if (billType.value === 'single') {
    // For single expense, check the singleExpense form directly
    return hasBasicFields &&
           singleExpense.value.description.trim().length > 0 &&
           singleExpense.value.value > 0
  } else {
    // For itemised bills, need bill name and at least one item
    return hasBasicFields &&
           formData.value.description.trim().length > 0 &&
           formData.value.line_items.length > 0
  }
})

const lineItemsCount = computed(() => {
  return formData.value.line_items.length
})

const totalAmount = computed(() => {
  return formData.value.line_items.reduce((sum, item) => sum + item.value, 0)
})

// Load tab data on mount
onMounted(async () => {
  if (!tabStore.currentTab || tabStore.currentTab.id !== tabId.value) {
    await tabStore.fetchTabById(tabId.value)
  }

  // Set default currency from tab
  if (tab.value?.default_currency) {
    formData.value.currency = tab.value.default_currency as Currency
  }

  // Auto-select first person as payer if not already selected
  if (tab.value?.people && tab.value.people.length > 0 && !formData.value.paid_by_id) {
    formData.value.paid_by_id = tab.value.people[0].id
  }
})

// Methods
const selectBillType = (type: 'single' | 'itemised') => {
  billType.value = type
  step.value = 1
}

const formatCurrency = (amount: number) => {
  return `${formData.value.currency} ${amount.toFixed(2)}`
}

const nextStep = () => {
  if (step.value === 1 && !canProceedToStep2.value) {
    // Show validation error if no expenses added
    if (billType.value === 'itemised' && lineItemsCount.value === 0) {
      showValidationError.value = true
    }
    // Show bill name error for itemised bills
    if (billType.value === 'itemised' && !formData.value.description.trim()) {
      showBillNameError.value = true
    }
    return
  }

  // Clear validation errors
  showValidationError.value = false
  showBillNameError.value = false

  // For single expense, add it to line_items before moving to step 2
  if (step.value === 1 && billType.value === 'single') {
    formData.value.line_items = [{
      description: singleExpense.value.description.trim(),
      value: singleExpense.value.value
    }]
  }

  // Initialize splits when moving to step 2
  if (step.value === 1) {
    initializeSplits()
  }

  step.value++
}

const previousStep = () => {
  if (step.value > 0) {
    step.value--
    // Reset bill type when going back to step 0
    if (step.value === 0) {
      billType.value = null
    }
  }
}

const addLineItem = () => {
  if (!newLineItem.value.description.trim() || newLineItem.value.value <= 0) {
    return
  }

  // Clear validation errors when adding item
  showValidationError.value = false
  showBillNameError.value = false

  // Add to beginning of array (newest first)
  formData.value.line_items.unshift({
    description: newLineItem.value.description.trim(),
    value: newLineItem.value.value
  })

  // Reset form
  newLineItem.value.description = ''
  newLineItem.value.value = 0
}

const removeLineItem = (index: number) => {
  formData.value.line_items.splice(index, 1)
  // Remove split data for this item
  delete splitModes.value[index]
  delete splits.value[index]
}

const initializeSplits = () => {
  // Initialize split modes and splits for all line items
  formData.value.line_items.forEach((_, index) => {
    if (!splitModes.value[index]) {
      splitModes.value[index] = 'even' // Default to even split
    }
    if (!splits.value[index]) {
      splits.value[index] = {}
      // Initialize all people with 1 share for even split
      tab.value?.people.forEach(person => {
        splits.value[index][person.id] = 1
      })
    }
  })
}

const setSplitMode = (itemIndex: number, mode: 'even' | 'custom') => {
  splitModes.value[itemIndex] = mode

  // If switching to even, reset all splits to 1
  if (mode === 'even' && tab.value) {
    tab.value.people.forEach(person => {
      splits.value[itemIndex][person.id] = 1
    })
  }
}

const calculateShareAmount = (itemIndex: number, personId: number): string => {
  const item = formData.value.line_items[itemIndex]
  if (!item || !splits.value[itemIndex]) return formatCurrency(0)

  const personShares = splits.value[itemIndex][personId] || 0

  // Calculate total shares for this item
  const totalShares = Object.values(splits.value[itemIndex]).reduce(
    (sum, shares) => sum + (shares || 0),
    0
  )

  if (totalShares === 0 || personShares === 0) return formatCurrency(0)

  // Calculate this person's share: (item_value × person_shares) ÷ total_shares
  const amount = (item.value * personShares) / totalShares

  return formatCurrency(amount)
}

const createBill = async () => {
  loading.value = true

  try {
    // Get the first person as creator (for now)
    const currentTab = tabStore.currentTab
    if (!currentTab || !currentTab.people || currentTab.people.length === 0) {
      console.error('No people in tab')
      return
    }

    // Convert line items to API format with splits
    const lineItems: LineItemCreate[] = formData.value.line_items.map((item, itemIndex) => {
      const personSplits: PersonSplitCreate[] = []

      // Build person splits based on split mode
      if (splitModes.value[itemIndex] === 'even') {
        // Even split: everyone gets 1 share
        currentTab.people.forEach(person => {
          personSplits.push({
            person_id: person.id,
            split_value: 1
          })
        })
      } else {
        // Custom split: use the values from splits state
        currentTab.people.forEach(person => {
          const shareValue = splits.value[itemIndex]?.[person.id] || 0
          if (shareValue > 0) {
            personSplits.push({
              person_id: person.id,
              split_value: shareValue
            })
          }
        })
      }

      return {
        description: item.description,
        value: item.value,
        split_type: SplitType.SHARES,
        person_splits: personSplits
      }
    })

    // For single expense, use item description; for itemised, use bill name
    const billDescription = billType.value === 'single'
      ? formData.value.line_items[0].description
      : formData.value.description.trim()

    const newBill = await billStore.createBill({
      tab_id: tabId.value,
      description: billDescription,
      currency: formData.value.currency,
      creator_id: currentTab.people[0].id,
      paid_by_id: formData.value.paid_by_id ?? undefined,
      line_items: lineItems
    })

    // Navigate back to tab view
    router.push(`/tabs/${tabId.value}`)
  } catch (error) {
    console.error('Failed to create bill:', error)
    // TODO: Show error notification
  } finally {
    loading.value = false
  }
}
</script>
