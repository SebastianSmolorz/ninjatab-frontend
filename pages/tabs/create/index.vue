<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <UContainer class="py-3 max-w-2xl">
        <div class="flex items-center gap-2">
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
          <div class="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </UContainer>
    </div>

    <!-- Step 1: Tab Name -->
    <div class="flex-1 overflow-y-auto pb-20">
      <UContainer class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              What's this tab for?
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Give your tab a name so everyone knows what it's for
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tab Name <span class="text-red-500">*</span>
            </label>
            <UInput
              v-model="draft.name"
              placeholder="e.g. Weekend in Berlin"
              size="xl"
              autofocus
              @keyup.enter="goNext"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <UTextarea
              v-model="draft.description"
              placeholder="Add more details about this tab..."
              :rows="3"
            />
          </div>

          <div class="flex gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Currency
              </label>
              <CurrencySelect v-model="draft.default_currency" />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For creating new bills
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Settlement Currency
              </label>
              <CurrencySelect v-model="draft.settlement_currency" />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Currency you want to change hands at the end
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Footer actions -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 inset-x-0 z-10">
      <UContainer class="py-4 max-w-2xl">
        <UButton
          @click="goNext"
          :disabled="!draft.name.trim()"
          size="lg"
          block
        >
          Continue
        </UButton>
      </UContainer>
    </div>
  </UMain>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTabDraftStore } from '~/stores/tabDraft'

definePageMeta({ middleware: 'auth' })

const draft = useTabDraftStore()
const api = useApi()

onMounted(async () => {
  draft.$reset()
  try {
    draft.contacts = await api.tabs.contacts()
  } catch {
    // Contacts are optional
  }
})

const goNext = () => {
  if (!draft.name.trim()) return
  navigateTo('/tabs/create/people')
}
</script>
