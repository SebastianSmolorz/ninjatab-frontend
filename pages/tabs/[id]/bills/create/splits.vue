<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-2xl mx-auto px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
        </div>
      </div>
    </div>

    <!-- Step 2: Split Expenses -->
    <div class="flex-1 overflow-y-auto pb-20">
      <UContainer class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              How are we splitting this?
            </h2>
          </div>

          <!-- Line Items with Splits -->
          <div class="space-y-6">
            <div
              v-for="(item, itemIndex) in draft.line_items"
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
                  :variant="draft.splitModes[itemIndex] === 'even' ? 'solid' : 'outline'"
                  size="sm"
                  @click="setSplitMode(itemIndex, 'even')"
                >
                  Split Evenly
                </UButton>
                <UButton
                  :variant="draft.splitModes[itemIndex] === 'custom' ? 'solid' : 'outline'"
                  size="sm"
                  @click="setSplitMode(itemIndex, 'custom')"
                >
                  Custom Split
                </UButton>
              </div>

              <!-- Custom Split - People List -->
              <SharePicker
                v-if="draft.splitModes[itemIndex] === 'custom'"
                :people="tab?.people || []"
                :model-value="draft.splits[itemIndex]"
                :item-value="item.value"
                :format-currency="formatCurrency"
                @update:model-value="draft.splits[itemIndex] = $event"
              />

              <!-- Even Split - Show who's included -->
              <div v-else class="text-sm text-gray-600 dark:text-gray-400">
                Split evenly between all {{ tab?.people.length }} people
              </div>
            </div>
          </div>
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'
import { useBillStore } from '~/stores/bills'
import { useBillDraftStore } from '~/stores/billDraft'
import { SplitType, type LineItemCreate, type PersonSplitCreate } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()
const billStore = useBillStore()
const draft = useBillDraftStore()

const tabId = computed(() => route.params.id as string)
const tab = computed(() => tabStore.currentTab)

const loading = ref(false)

// Guard: redirect if no line items
if (draft.line_items.length === 0) {
  navigateTo(`/tabs/${tabId.value}/bills/create`, { replace: true })
}

const formatCurrency = (amount: number) => {
  return `${getCurrencySymbol(draft.currency)}${amount.toFixed(2)}`
}

const setSplitMode = (itemIndex: number, mode: 'even' | 'custom') => {
  draft.splitModes[itemIndex] = mode

  if (tab.value) {
    if (mode === 'even') {
      tab.value.people.forEach(person => {
        draft.splits[itemIndex][person.id] = 1
      })
    } else {
      tab.value.people.forEach(person => {
        draft.splits[itemIndex][person.id] = 0
      })
    }
  }
}

const createBill = async () => {
  loading.value = true

  try {
    const currentTab = tabStore.currentTab
    if (!currentTab || !currentTab.people || currentTab.people.length === 0) {
      console.error('No people in tab')
      return
    }

    const lineItems: LineItemCreate[] = draft.line_items.map((item, itemIndex) => {
      const personSplits: PersonSplitCreate[] = []

      if (draft.splitModes[itemIndex] === 'even') {
        currentTab.people.forEach(person => {
          personSplits.push({
            person_id: person.id,
            split_value: 1
          })
        })
      } else {
        currentTab.people.forEach(person => {
          const shareValue = draft.splits[itemIndex]?.[person.id] || 0
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

    const billDescription = draft.billType === 'single'
      ? draft.line_items[0].description
      : draft.description.trim()

    await billStore.createBill({
      tab_id: tabId.value,
      description: billDescription,
      currency: draft.currency,
      creator_id: currentTab.people[0].id,
      paid_by_id: draft.paid_by_id ?? undefined,
      line_items: lineItems
    })

    draft.$reset()
    navigateTo(`/tabs/${tabId.value}`)
  } catch (error) {
    console.error('Failed to create bill:', error)
  } finally {
    loading.value = false
  }
}
</script>
