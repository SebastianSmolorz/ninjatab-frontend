<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-2xl mx-auto px-4 py-3">
        <div class="flex items-center gap-2">
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
          <div
            :class="[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              step >= 3 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          ></div>
        </div>
      </div>
    </div>

    <!-- Form container -->
    <div class="flex-1 overflow-y-auto">
      <!-- Step 1: Bill Details -->
      <UContainer v-if="step === 1" class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bill Details
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              What's this bill for?
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bill Name <span class="text-red-500">*</span>
            </label>
            <UInput
              v-model="formData.description"
              placeholder="e.g., Dinner at Restaurant, Groceries"
              size="xl"
              autofocus
              @keyup.enter="nextStep"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency <span class="text-red-500">*</span>
            </label>
            <USelect
              v-model="formData.currency"
              :items="currencyOptions"
              size="xl"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Who Paid? <span class="text-red-500">*</span>
            </label>
            <USelect
              v-model="formData.paid_by_id"
              :items="peopleOptions"
              size="xl"
              placeholder="Select who paid for this bill"
            />
          </div>
        </div>
      </UContainer>

      <!-- Step 2: Add Line Items -->
      <UContainer v-if="step === 2" class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Add Line Items
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Break down the bill into individual items
            </p>
          </div>

          <!-- Add Line Item Form (always at top) -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Item
            </h3>
            <div class="flex gap-3">
              <UInput
                v-model="newLineItem.description"
                placeholder="Item name"
                size="lg"
                class="flex-1"
                @keyup.enter="addLineItem"
              />
              <UInput
                v-model.number="newLineItem.value"
                type="number"
                step="0.01"
                placeholder="0.00"
                size="lg"
                class="w-32"
                @keyup.enter="addLineItem"
              />
              <UButton
                @click="addLineItem"
                icon="i-heroicons-plus"
                size="lg"
              >
                Add
              </UButton>
            </div>
          </div>

          <!-- Line Items List (newest first) -->
          <div v-if="formData.line_items.length > 0" class="space-y-3">
            <div
              v-for="(item, index) in formData.line_items"
              :key="index"
              class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
            >
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ item.description }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatCurrency(item.value) }}
                </div>
              </div>
              <UButton
                @click="removeLineItem(index)"
                variant="ghost"
                icon="i-heroicons-trash"
                size="sm"
              />
            </div>

            <!-- Total -->
            <div class="bg-primary-50 dark:bg-primary-950 rounded-lg border border-primary-200 dark:border-primary-800 p-4">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-gray-900 dark:text-white">Total</span>
                <span class="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {{ formatCurrency(totalAmount) }}
                </span>
              </div>
            </div>
          </div>

          <UAlert
            v-else
            icon="i-heroicons-information-circle"
            color="primary"
            variant="soft"
            title="No items yet"
            description="Add at least one line item to continue"
          />
        </div>
      </UContainer>

      <!-- Step 3: Create Splits -->
      <UContainer v-if="step === 3" class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Split the Bill
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Assign shares to each person for each item
            </p>
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
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">How many</span>
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
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
      <UContainer class="py-4 max-w-2xl">
        <div class="flex gap-3">
          <UButton
            v-if="step > 1"
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
            block
          >
            Continue
          </UButton>
          <UButton
            v-if="step === 2"
            @click="nextStep"
            :disabled="!canProceedToStep3"
            size="lg"
            class="flex-1"
          >
            Continue
          </UButton>
          <UButton
            v-if="step === 3"
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
const step = ref(1)
const loading = ref(false)

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
  return formData.value.description.trim().length > 0 &&
         formData.value.currency &&
         formData.value.paid_by_id !== null
})

const canProceedToStep3 = computed(() => {
  return formData.value.line_items.length > 0
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
const formatCurrency = (amount: number) => {
  return `${formData.value.currency} ${amount.toFixed(2)}`
}

const nextStep = () => {
  if (step.value === 1 && !canProceedToStep2.value) return
  if (step.value === 2 && !canProceedToStep3.value) return

  // Initialize splits when moving to step 3
  if (step.value === 2) {
    initializeSplits()
  }

  step.value++
}

const previousStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const addLineItem = () => {
  if (!newLineItem.value.description.trim() || newLineItem.value.value <= 0) {
    return
  }

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
      // Initialize all people with 0 shares
      tab.value?.people.forEach(person => {
        splits.value[index][person.id] = 0
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

    const newBill = await billStore.createBill({
      tab_id: tabId.value,
      description: formData.value.description.trim(),
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
