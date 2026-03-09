<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <UContainer class="py-3 max-w-2xl">
        <div class="flex items-center gap-2">
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
          <div class="h-1 flex-1 rounded-full bg-primary-500"></div>
        </div>
      </UContainer>
    </div>

    <!-- Step 2: Add People -->
    <div class="flex-1 overflow-y-auto pb-20">
      <UContainer class="py-8 max-w-2xl">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Who's involved?
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Add the people who will be sharing expenses on this tab
            </p>
          </div>

          <!-- People list -->
          <div class="space-y-3">
            <div
              v-for="(person, index) in draft.people"
              :key="index"
              class="flex items-center gap-3"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <div
                  class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0"
                  :class="person.user_id || index === 0 ? 'dark:bg-primary-800' : 'dark:bg-gray-700'"
                >
                  <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">
                    {{ person.name ? person.name.charAt(0).toUpperCase() : '?' }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <input
                    v-model="person.name"
                    :placeholder="index === 0 ? 'Your name' : 'Name'"
                    class="w-full bg-transparent text-gray-900 dark:text-white outline-none placeholder-gray-400"
                  />
                  <p v-if="person.email" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ person.email }}</p>
                  <p v-else-if="index !== 0" class="text-xs text-gray-500 dark:text-gray-400 opacity-0">Not joined</p>
                </div>
                <span v-if="index === 0" class="text-xs text-gray-500 dark:text-gray-400 shrink-0">(you)</span>
              </div>
              <UButton
                v-if="index !== 0"
                @click="removePerson(index)"
                variant="ghost"
                icon="i-heroicons-trash"
                size="lg"
              />
            </div>
          </div>

          <!-- New person input row -->
          <PersonAddRow
            :contacts="availableContacts"
            @add="onAddPerson"
          />

          <UAlert
            v-if="draft.people.length < 1 || !hasValidPeople"
            icon="i-heroicons-information-circle"
            color="primary"
            variant="soft"
            title="Add at least one other person"
            description="A tab needs at least one person besides you"
          />
          <UAlert
            v-if="draft.people.length > 1 && hasDuplicateNames"
            icon="i-heroicons-information-circle"
            color="warning"
            variant="soft"
            title="Duplicated names"
            description="All names need to be unique. You can change them above."
          />
        </div>
      </UContainer>
    </div>

    <!-- Footer actions -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 inset-x-0 z-10">
      <UContainer class="py-4 max-w-2xl">
        <div class="flex gap-3">
          <UButton
            @click="router.back()"
            variant="outline"
            size="lg"
            class="flex-1"
          >
            Back
          </UButton>
          <UButton
            @click="createTab"
            :disabled="!canCreate"
            :loading="loading"
            size="lg"
            class="flex-1"
          >
            Create Tab
          </UButton>
        </div>
      </UContainer>
    </div>
  </UMain>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'
import { useAuthStore } from '~/stores/auth'
import { useTabDraftStore, type PersonEntry } from '~/stores/tabDraft'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const tabStore = useTabStore()
const authStore = useAuthStore()
const draft = useTabDraftStore()

const loading = ref(false)

// Guard: redirect if no name set
if (!draft.name.trim()) {
  navigateTo('/tabs/create', { replace: true })
}

// Computed
const hasValidPeople = computed(() => {
  return draft.people.slice(1).some(p => p.name.trim().length > 0)
})

const hasDuplicateNames = computed(() => {
  const names = draft.people
    .map(p => p.name.trim().toLowerCase())
    .filter(n => n.length > 0)
  return new Set(names).size !== names.length
})

const canCreate = computed(() => {
  return draft.name.trim().length > 0 && hasValidPeople.value && !hasDuplicateNames.value
})

const availableContacts = computed(() => {
  const selectedUserIds = new Set(
    draft.people
      .filter(p => p.user_id)
      .map(p => p.user_id)
  )
  return draft.contacts.filter(c => !selectedUserIds.has(c.user_id))
})

const onAddPerson = (entry: PersonEntry) => {
  draft.people.push(entry)
}

const removePerson = (index: number) => {
  if (draft.people.length > 1) {
    draft.people.splice(index, 1)
  }
}

const createTab = async () => {
  if (!canCreate.value) return

  loading.value = true

  try {
    const validPeople = draft.people
      .filter(p => p.name.trim().length > 0)
      .map((p, index) => ({
        name: p.name.trim(),
        ...(index === 0 && authStore.user?.id ? { user_id: authStore.user.id } : {}),
        ...(index !== 0 && p.user_id ? { user_id: p.user_id } : {}),
      }))

    const newTab = await tabStore.createTab({
      name: draft.name.trim(),
      description: draft.description.trim(),
      default_currency: draft.default_currency,
      settlement_currency: draft.settlement_currency,
      people: validPeople
    })

    draft.$reset()
    navigateTo(`/tabs/${newTab.id}`)
  } catch (error) {
    console.error('Failed to create tab:', error)
  } finally {
    loading.value = false
  }
}
</script>
