<template>
  <UMain class="bg-gray-900 min-h-screen">
    <!-- Hero -->
    <section class="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-20 bg-gray-900">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/15%,_transparent_55%)] opacity-40" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/20%,_transparent_60%)] opacity-50" />
      <UContainer class="relative">
        <div class="max-w-2xl mx-auto text-center">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Contact</span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight">
            Got a question? <span class="text-primary-400">Drop us a line.</span>
          </h1>
          <p class="mt-6 text-lg text-gray-300 leading-relaxed">
            Feedback, feature requests, bug reports, or just want to say hi — every message lands in our inbox.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Contact card -->
    <section class="relative pb-24 lg:pb-32 bg-gray-900">
      <UContainer>
        <div class="max-w-xl mx-auto p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-700/5 ring-1 ring-primary-500/30">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 rounded-xl bg-primary-500/20 ring-1 ring-primary-500/30 flex items-center justify-center">
              <UIcon name="i-lucide-mail" class="size-6 text-primary-400" />
            </div>
            <div>
              <h2 class="text-white font-semibold text-lg leading-tight">Email us</h2>
              <p class="text-gray-400 text-sm">We typically reply within a day or two.</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch gap-3">
            <UButton
              icon="i-lucide-mail"
              size="lg"
              to="mailto:seb@tab.ninja"
              external
              class="flex-1 justify-center"
              block
            >
              seb@tab.ninja
            </UButton>

            <UButton
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              size="lg"
              variant="outline"
              color="neutral"
              class="justify-center"
              @click="copyEmail"
            >
              {{ copied ? 'Copied' : 'Copy' }}
            </UButton>
          </div>
        </div>

        <!-- Secondary links -->
        <div class="max-w-xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NuxtLink
            to="/splitwise-alternative"
            class="group p-5 rounded-xl bg-gray-800/50 ring-1 ring-white/10 hover:ring-primary-500/40 transition flex items-center gap-3"
          >
            <UIcon name="i-lucide-repeat" class="size-5 text-primary-400" />
            <div class="flex-1">
              <p class="text-white font-medium text-sm">Splitwise alternative</p>
              <p class="text-gray-400 text-xs">Why we built Ninja Tab</p>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="size-4 text-gray-500 group-hover:text-primary-400 transition" />
          </NuxtLink>
          <NuxtLink
            to="/join"
            class="group p-5 rounded-xl bg-gray-800/50 ring-1 ring-white/10 hover:ring-primary-500/40 transition flex items-center gap-3"
          >
            <UIcon name="i-lucide-rocket" class="size-5 text-primary-400" />
            <div class="flex-1">
              <p class="text-white font-medium text-sm">Download the app</p>
              <p class="text-gray-400 text-xs">Get Ninja Tab on iOS or Android</p>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="size-4 text-gray-500 group-hover:text-primary-400 transition" />
          </NuxtLink>
        </div>
      </UContainer>
    </section>
  </UMain>
</template>

<script setup lang="ts">
const copied = ref(false)

async function copyEmail() {
  const ok = await copyToClipboard('seb@tab.ninja')
  copied.value = ok
  setTimeout(() => { copied.value = false }, 2000)
}

useSeoMeta({
  title: 'Contact Ninja Tab',
  description: 'Get in touch with the Ninja Tab team — feedback, feature requests and support.',
})
</script>
