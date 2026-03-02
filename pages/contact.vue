<template>
  <UMain>
    <UContainer class="py-16 flex flex-col items-center">
      <h1 class="text-3xl font-bold mb-6">Contact Us</h1>
      <p class="text-gray-400 mb-8 text-center max-w-md">
        Got a question, feedback, or just want to say hi? Drop us an email.
      </p>

      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-mail"
          size="lg"
          to="mailto:seb@tab.ninja"
          external
        >
          seb@tab.ninja
        </UButton>

        <UButton
          icon="i-lucide-copy"
          size="lg"
          variant="outline"
          @click="copyEmail"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </UButton>
      </div>
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
const copied = ref(false)

async function copyEmail() {
  await navigator.clipboard.writeText('seb@tab.ninja')
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

useSeoMeta({
  title: 'Contact Us - Tab.ninja',
  description: 'Get in touch with the Tab.ninja team.',
})
</script>
