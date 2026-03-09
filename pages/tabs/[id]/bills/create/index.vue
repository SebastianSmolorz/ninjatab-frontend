<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-2xl mx-auto px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
          <div class="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- Step 0: Choose Bill Type -->
    <div class="flex-1 overflow-y-auto">
      <UContainer class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              What are we splitting?
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
            </p>
          </div>

          <div class="grid gap-4 relative">
            <!-- Loading overlay when user clicked but limits still loading -->
            <div
              v-if="pendingBillType"
              class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 rounded-lg"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary-500 animate-spin" />
            </div>

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
              @click="navigateTo(`/tabs/${tabId}`)"
              variant="ghost"
              icon="i-heroicons-arrow-long-left"
            >
              Back to Tab
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>
  </UMain>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'
import { useAuthStore } from '~/stores/auth'
import { useBillDraftStore } from '~/stores/billDraft'
import { Currency } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()
const authStore = useAuthStore()
const draft = useBillDraftStore()
const api = useApi()

const tabId = computed(() => route.params.id as string)
const tab = computed(() => tabStore.currentTab)

const canSingle = ref<boolean | null>(null)
const canItemised = ref<boolean | null>(null)
const limitsLoaded = computed(() => canSingle.value !== null && canItemised.value !== null)
const pendingBillType = ref<'single' | 'itemised' | null>(null)

onMounted(async () => {
  draft.$reset()

  if (!tabStore.currentTab || String(tabStore.currentTab.id) !== tabId.value) {
    await tabStore.fetchTabById(tabId.value)
  }

  // Check limits concurrently
  api.tabs.canAddSingle(tabId.value)
    .then(() => { canSingle.value = true })
    .catch(() => { canSingle.value = false })
  api.tabs.canAddItemised(tabId.value)
    .then(() => { canItemised.value = true })
    .catch(() => { canItemised.value = false })

  // Set default currency from tab
  if (tab.value?.default_currency) {
    draft.currency = tab.value.default_currency as Currency
  }

  // Default "who paid" to the logged-in user's tab person, fallback to first person
  if (tab.value?.people && tab.value.people.length > 0 && !draft.paid_by_id) {
    const me = tab.value.people.find(p => p.user?.id === authStore.user?.id)
    draft.paid_by_id = me?.id ?? tab.value.people[0].id
  }
})

const proceedWithBillType = (type: 'single' | 'itemised') => {
  const allowed = type === 'single' ? canSingle.value : canItemised.value
  if (!allowed) {
    navigateTo(`/tabs/${tabId.value}/upgrade`)
    return
  }
  draft.billType = type
  navigateTo(`/tabs/${tabId.value}/bills/create/details`)
}

const selectBillType = (type: 'single' | 'itemised') => {
  if (!limitsLoaded.value) {
    pendingBillType.value = type
    return
  }
  proceedWithBillType(type)
}

watch(limitsLoaded, (loaded) => {
  if (loaded && pendingBillType.value) {
    const type = pendingBillType.value
    pendingBillType.value = null
    proceedWithBillType(type)
  }
})
</script>
