<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-2xl mx-auto px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
          <div class="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- Step 1: Expenses & Details -->
    <div class="flex-1 overflow-y-auto pb-20">
      <UContainer class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {{ draft.billType === 'single' ? 'Adding Expense' : 'Adding itemised bill' }}
            </h2>
            <p v-if="draft.billType !== 'single'" class="text-gray-600 dark:text-gray-400">
              Enter item totals, not per unit price. £15 for 3 beers, not £5 each.
            </p>
          </div>

          <!-- Bill Name (only for itemised), Who Paid, and Currency -->
          <div class="flex gap-4">
            <div v-if="draft.billType === 'itemised'" class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bill Name <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="draft.description"
                placeholder="e.g., Dinner at Restaurant"
                class="w-full"
                size="lg"
              />
            </div>
            <div :class="['flex flex-col flex-shrink-0', draft.billType === 'itemised' && 'items-end']">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 w-auto">
                Who Paid? <span class="text-red-500">*</span>
              </label>
              <USelect
                v-model="draft.paid_by_id"
                :items="peopleOptions"
                size="lg"
                placeholder="Select"
              />
            </div>
            <div v-if="draft.billType === 'single'" class="flex-1"></div>
            <div class="flex flex-col items-end flex-shrink-0">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 w-auto">
                Currency <span class="text-red-500">*</span>
              </label>
              <CurrencySelect v-model="draft.currency" size="lg" />
            </div>
          </div>

          <!-- Single Expense Form -->
          <div v-if="draft.billType === 'single'" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex gap-3 items-end">
              <div class="flex-1 min-w-0">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <UInput
                  v-model="draft.singleExpense.description"
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
                  v-model.number="draft.singleExpense.value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  size="lg"
                />
              </div>
            </div>
          </div>

          <!-- Itemised Bill - Add Line Item Form -->
          <div v-if="draft.billType === 'itemised'" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
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
          <div v-if="draft.billType === 'itemised' && draft.line_items.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <!-- Receipt header -->
            <div class="border-b-2 border-dashed border-gray-300 px-5 py-3 text-center">
              <div class="text-xs text-gray-500 uppercase tracking-widest">Receipt</div>
            </div>

            <!-- Receipt items -->
            <div class="px-5 py-3 font-mono text-sm">
              <div
                v-for="(item, index) in draft.line_items"
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

          <!-- Validation Alerts -->
          <UAlert
            v-if="draft.billType === 'itemised' && showValidationError"
            icon="i-heroicons-exclamation-triangle"
            type="red"
            variant="soft"
            title="No items added"
            description="Please add at least one item to continue"
          />

          <UAlert
            v-if="draft.billType === 'itemised' && showBillNameError"
            icon="i-heroicons-exclamation-triangle"
            type="danger"
            variant="soft"
            title="Bill name required"
            description="Please enter a name for your bill"
          />
        </div>
      </UContainer>
    </div>

    <!-- Footer actions -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 inset-x-0 z-10">
      <UContainer class="py-4 max-w-2xl">
        <div class="flex gap-3">
          <UButton
            @click="router.back()"
            variant="outline"
            size="lg"
            class="flex-1"
          >
            Back
          </UButton>
          <UButton
            @click="goNext"
            :disabled="!canProceedToSplits"
            size="lg"
            class="flex-1"
          >
            Continue
          </UButton>
        </div>
      </UContainer>
    </div>
  </UMain>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'
import { useBillDraftStore } from '~/stores/billDraft'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()
const draft = useBillDraftStore()

const tabId = computed(() => route.params.id as string)
const tab = computed(() => tabStore.currentTab)

// Guard: redirect if no bill type selected
if (!draft.billType) {
  navigateTo(`/tabs/${tabId.value}/bills/create`, { replace: true })
}

const showValidationError = ref(false)
const showBillNameError = ref(false)

const newLineItem = ref({ description: '', value: 0 })

const peopleOptions = computed(() => {
  if (!tab.value?.people) return []
  return tab.value.people.map(person => ({
    label: person.name,
    value: person.id
  }))
})

const canProceedToSplits = computed(() => {
  const hasBasicFields = draft.currency && draft.paid_by_id !== null

  if (draft.billType === 'single') {
    return hasBasicFields &&
      draft.singleExpense.description.trim().length > 0 &&
      draft.singleExpense.value > 0
  } else {
    return hasBasicFields &&
      draft.description.trim().length > 0 &&
      draft.line_items.length > 0
  }
})

const lineItemsCount = computed(() => draft.line_items.length)

const totalAmount = computed(() => {
  return draft.line_items.reduce((sum, item) => sum + item.value, 0)
})

const formatCurrency = (amount: number) => {
  return `${getCurrencySymbol(draft.currency)}${amount.toFixed(2)}`
}

const addLineItem = () => {
  if (!newLineItem.value.description.trim() || newLineItem.value.value <= 0) return

  showValidationError.value = false
  showBillNameError.value = false

  draft.line_items.unshift({
    description: newLineItem.value.description.trim(),
    value: newLineItem.value.value
  })

  newLineItem.value.description = ''
  newLineItem.value.value = 0
}

const removeLineItem = (index: number) => {
  draft.line_items.splice(index, 1)
  delete draft.splitModes[index]
  delete draft.splits[index]
}

const goNext = () => {
  if (!canProceedToSplits.value) {
    if (draft.billType === 'itemised' && lineItemsCount.value === 0) {
      showValidationError.value = true
    }
    if (draft.billType === 'itemised' && !draft.description.trim()) {
      showBillNameError.value = true
    }
    return
  }

  showValidationError.value = false
  showBillNameError.value = false

  // For single expense, populate line_items before moving to splits
  if (draft.billType === 'single') {
    draft.line_items = [{
      description: draft.singleExpense.description.trim(),
      value: draft.singleExpense.value
    }]
  }

  // Initialize splits
  initializeSplits()

  navigateTo(`/tabs/${tabId.value}/bills/create/splits`)
}

const initializeSplits = () => {
  draft.line_items.forEach((_, index) => {
    if (!draft.splitModes[index]) {
      draft.splitModes[index] = 'even'
    }
    if (!draft.splits[index]) {
      draft.splits[index] = {}
      tab.value?.people.forEach(person => {
        draft.splits[index][person.id] = 1
      })
    }
  })
}
</script>
