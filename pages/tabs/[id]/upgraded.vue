<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center">
    <UContainer class="max-w-lg">
      <div class="text-center space-y-8">
        <div class="flex justify-center">
          <img src="/logo.png" alt="Tab Ninja" class="w-28" />
        </div>

        <div class="space-y-3">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            This one is on us
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            As an early user of Tab Ninja this tab has been upgraded to Pro free of charge.
          </p>
        </div>

        <UButton
          size="xl"
          block
          :to="`/tabs/${tabId}`"
        >
          Back to tab
        </UButton>
      </div>
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const tabId = computed(() => route.params.id as string)
</script>
