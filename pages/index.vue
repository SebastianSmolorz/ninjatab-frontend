<template>
  <UMain class="bg-gray-900">
    <UContainer>
      <!-- Hero Section -->
      <div class="flex flex-col items-center pt-16 pb-12">
        <!-- Logo with hover/click toggle -->
        <div
          class="logo-container relative mb-8 cursor-pointer select-none"
          :class="{ 'logo-active': logoActive }"
          @click="logoActive = !logoActive"
        >
          <img
            src="/logo1-small.png"
            alt="NinjaTab"
            class="logo-base w-40"
          />
          <img
            src="/logo1-small-hover.png"
            alt="NinjaTab hover"
            class="logo-hover w-40 absolute top-0 left-0"
          />
        </div>

        <!-- Animated Tagline -->
        <div class="text-center mb-10">
          <div class="text-3xl md:text-4xl font-bold text-white leading-tight">
            Stick it on the tab<span
              class="text-primary-400 transition-opacity duration-700"
              :class="phase >= 1 ? 'opacity-100' : 'opacity-0'"
            >.ninja</span>
          </div>
          <div
            class="text-3xl md:text-4xl font-bold leading-tight transition-opacity duration-700 mt-1"
            :class="phase >= 1 ? 'opacity-100' : 'opacity-0'"
          >
            <span class="text-primary-400">Split</span>
            <span class="text-white"> it on the tab</span><span class="text-primary-400">.ninja</span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-gray-400 text-md max-w-lg text-center mb-10">
          Holidays, nights out, shared meals, group tickets — anywhere money gets messy.
          The app lets you add shared expenses, keeps track of expenses, and makes settling up simple. No more chasing payments or maths.
        </p>

        <!-- CTA Button -->
        <div class="w-full max-w-sm">
          <UButton
            size="xl"
            block
            to="/login"
          >
            Start splitting bills like a ninja
          </UButton>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-16 pt-8 max-w-4xl mx-auto">
        <UPageFeature
          v-for="benefit in benefits"
          :key="benefit.title"
          :icon="benefit.icon"
          :title="benefit.title"
          :description="benefit.description"
          orientation="vertical"
          class="text-center p-6 rounded-xl bg-gray-800/50"
        >
        </UPageFeature>
      </div>
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
const logoActive = ref(false)
const phase = ref(0)

const benefits = [
  {
    icon: 'i-lucide-message-circle-off',
    title: 'No more awkward chats',
    description: 'Stop the endless "who owes what" messages after a night out'
  },
  {
    icon: 'i-lucide-calculator',
    title: 'Simplified settlements',
    description: 'Reduce number of payments with a clear breakdown of who pays whom'
  },
  {
    icon: 'i-lucide-heart',
    title: 'Free to use',
    description: 'Generous free usage. No subscriptions'
  }
]

useSeoMeta({
  title: 'Tab.ninja. Split shared costs',
  description: 'Start a tab, add or scan receipts, simplify settling payments.',
})

onMounted(() => {
  setTimeout(() => { phase.value = 1 }, 1000)
})
</script>

<style scoped>
/* Logo crossfade */
.logo-hover {
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.logo-container:hover .logo-hover,
.logo-active .logo-hover {
  opacity: 1;
}

.logo-container:hover .logo-base,
.logo-active .logo-base {
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.logo-base {
  transition: opacity 0.4s ease-in-out;
}

</style>
