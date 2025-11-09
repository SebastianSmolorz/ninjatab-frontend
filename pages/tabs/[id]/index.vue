<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 py-8">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        variant="soft"
        title="Error loading tab"
        :description="error"
      />
    </div>

    <!-- Tab content -->
    <div v-else-if="tab" class="max-w-7xl mx-auto px-4 py-8">
      <div class="space-y-6">
        <!-- Tab info -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-start justify-between mb-2">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ tab.name }}
            </h2>
            <div class="flex items-center gap-3">
              <div>
                <div v-if="tab.is_settled" class="text-sm text-gray-600 dark:text-gray-400">
                  Settled
                </div>
                <div v-else class="text-sm text-green-600 dark:text-green-400">
                  Open
                </div>
              </div>
              <UButton
                v-if="!tab.is_settled"
                variant="outline"
                size="sm"
                @click="settleTab"
                :loading="settlingTab"
              >
                Mark as Settled
              </UButton>
            </div>
          </div>
          <p v-if="tab.description" class="text-gray-600 dark:text-gray-400 mb-4">
            {{ tab.description }}
          </p>
          <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ tab.default_currency }}</span>
            <span>•</span>
            <span>{{ tab.bill_count }} {{ tab.bill_count === 1 ? 'bill' : 'bills' }}</span>
          </div>
        </div>

        <!-- People -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            People
          </h3>
          <div class="flex flex-wrap gap-4">
            <div
              v-for="person in tab.people"
              :key="person.id"
              class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3 min-w-0"
            >
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {{ person.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="min-w-0">
                <div class="font-medium text-gray-900 dark:text-white truncate">
                  {{ person.name }}
                </div>
                <div v-if="person.email" class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ person.email }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bills section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Bills
            </h3>
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              @click="router.push(`/tabs/${tab.id}/bills/create`)"
            >
              Add Bill
            </UButton>
          </div>

          <!-- Bills list -->
          <div v-if="bills && bills.length > 0" class="space-y-3">
            <div
              v-for="bill in bills"
              :key="bill.id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer"
              @click="tab && router.push(`/tabs/${tab.id}/bills/${bill.id}`)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ bill.description }}
                  </h4>
                  <div class="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span v-if="bill.date">{{ formatDate(bill.date) }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ bill.currency }} {{ (bill.total_amount || 0) }}
                  </div>
                  <div v-if="bill.is_closed" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Closed
                  </div>
                  <div v-else class="text-xs text-green-600 dark:text-green-400 mt-1">
                    Open
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            No bills yet. Add your first expense to get started.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'
import { useBillStore } from '~/stores/bills'

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()
const billStore = useBillStore()

// State
const settlingTab = ref(false)

// Computed
const tab = computed(() => tabStore.currentTab)
const loading = computed(() => tabStore.isLoading)
const error = computed(() => tabStore.error)
const bills = computed(() => billStore.bills)

// Helper functions
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
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

const settleTab = async () => {
  if (!tab.value) return

  settlingTab.value = true
  try {
    const api = useApi()
    await api.tabs.settle(tab.value.id)
    await tabStore.fetchTabById(tab.value.id)
  } catch (error) {
    console.error('Failed to settle tab:', error)
    // TODO: Show error notification
  } finally {
    settlingTab.value = false
  }
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
  } catch (error) {
    console.error('Failed to load tab or bills:', error)
  }
})
</script>
