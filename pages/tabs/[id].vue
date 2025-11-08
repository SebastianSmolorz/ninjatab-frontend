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
        color="red"
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
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ tab.name }}
          </h2>
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
          <div class="space-y-3">
            <div
              v-for="person in tab.people"
              :key="person.id"
              class="flex items-center gap-3"
            >
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
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
          </div>
        </div>

        <!-- Bills section (placeholder) -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Bills
            </h3>
            <UButton
              icon="i-heroicons-plus"
              size="sm"
            >
              Add Bill
            </UButton>
          </div>
          <div class="text-center py-8 text-gray-500 dark:text-gray-400">
            No bills yet. Add your first expense to get started.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()

// Computed
const tab = computed(() => tabStore.currentTab)
const loading = computed(() => tabStore.isLoading)
const error = computed(() => tabStore.error)

// Load tab on mount
onMounted(async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/')
    return
  }

  try {
    await tabStore.fetchTabById(id)
  } catch (error) {
    console.error('Failed to load tab:', error)
  }
})
</script>
