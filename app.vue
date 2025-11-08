<template>
  <div class="min-h-screen">
    <!-- Top-level navbar -->
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo/Brand -->
          <NuxtLink to="/" class="flex items-center space-x-2">
            <span class="text-xl font-bold text-primary-600 dark:text-primary-400">
              NinjaTab
            </span>
          </NuxtLink>

          <!-- Navigation items -->
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/tabs"
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Tabs
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// App-level setup can go here if needed
</script>
