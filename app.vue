<template>
  <UApp>
    <UHeader title="NinjaTab" to="/">
      <template #right>
        <UNavigationMenu :items="navLinks" />
      </template>

      <template #body>
        <UNavigationMenu :items="navLinks" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>

    <!-- Page content -->
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
const navLinks = [
  {
    label: 'Tabs',
    to: '/tabs'
  }
]
</script>
