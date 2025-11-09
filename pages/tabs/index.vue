<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Your Tabs
          </h2>
          <UButton
            icon="i-heroicons-plus"
            size="lg"
            @click="navigateToCreate"
          >
            New Tab
          </UButton>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
        </div>

        <!-- Error state -->
        <UAlert
          v-else-if="error"
          icon="i-heroicons-exclamation-triangle"
          variant="soft"
          title="Error loading tabs"
          :description="error"
        />

        <!-- Empty state -->
        <div
          v-else-if="tabs.length === 0"
          class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <UIcon name="i-heroicons-clipboard-document-list" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No tabs yet
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Create your first tab to start tracking shared expenses
          </p>
          <UButton
            icon="i-heroicons-plus"
            size="lg"
            @click="navigateToCreate"
          >
            Create Your First Tab
          </UButton>
        </div>

        <!-- Tabs list -->
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'rounded-lg border p-6 transition-colors cursor-pointer',
              tab.is_settled
                ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-800 opacity-60 hover:opacity-80'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400'
            ]"
            @click="navigateToTab(tab.id)"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ tab.name }}
              </h3>
              <div v-if="tab.is_settled" class="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Closed
              </div>
            </div>
            <p v-if="tab.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ tab.description }}
            </p>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">
                {{ tab.bill_count }} {{ tab.bill_count === 1 ? 'bill' : 'bills' }}
              </span>
              <span class="text-gray-500 dark:text-gray-400">
                {{ tab.default_currency }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'

const router = useRouter()
const tabStore = useTabStore()

// Computed
const tabs = computed(() => tabStore.tabs)
const loading = computed(() => tabStore.isLoading)
const error = computed(() => tabStore.error)

// Methods
const navigateToCreate = () => {
  router.push('/tabs/create')
}

const navigateToTab = (id: number) => {
  router.push(`/tabs/${id}`)
}

// Load tabs on mount
onMounted(async () => {
  try {
    await tabStore.fetchTabs()
  } catch (error) {
    console.error('Failed to load tabs:', error)
  }
})
</script>
