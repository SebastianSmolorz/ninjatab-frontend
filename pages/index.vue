<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- Logo/Brand -->
      <div class="mb-8">
        <h1 class="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-3">
          NinjaTab
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Split bills like a ninja
        </p>
      </div>

      <!-- Action buttons -->
      <div class="space-y-4">
        <UButton
          size="xl"
          block
          icon="i-heroicons-plus-circle"
          @click="router.push('/tabs/create')"
        >
          Add Tab
        </UButton>

        <UButton
          size="xl"
          block
          variant="outline"
          icon="i-heroicons-queue-list"
          @click="router.push('/tabs')"
        >
          View Tabs
        </UButton>
      </div>

      <!-- Optional tagline -->
      <p class="mt-12 text-sm text-gray-500 dark:text-gray-400">
        Track shared expenses with friends and family
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
