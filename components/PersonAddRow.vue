<script setup lang="ts">
import type { Contact } from '~/types'

interface PersonEntry {
  name: string
  user_id?: string
  email?: string
}

const props = defineProps<{
  contacts: Contact[]
  placeholder?: string
}>()

const emit = defineEmits<{
  add: [entry: PersonEntry]
}>()

const inputText = ref('')
const selectedUserId = ref<string | undefined>()
const inputRef = ref<{ input: HTMLInputElement } | null>(null)

const filteredContacts = computed(() => {
  const query = inputText.value.trim().toLowerCase()
  const filtered = !query
    ? props.contacts
    : props.contacts.filter(c => {
        const full = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase()
        return full.includes(query)
      })
  return filtered.slice(0, 5)
})

function selectSuggestion(contact: Contact) {
  const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
  emit('add', { name, user_id: contact.user_id, email: contact.email })
}

function addPerson() {
  const name = inputText.value.trim()
  if (!name) return
  emit('add', { name, user_id: selectedUserId.value })
  inputText.value = ''
  selectedUserId.value = undefined
  nextTick(() => inputRef.value?.input?.focus())
}

function onInput() {
  // Clear linked user_id when user changes text after selecting a suggestion
  selectedUserId.value = undefined
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-3">
      <UInput
        ref="inputRef"
        v-model="inputText"
        :placeholder="placeholder ?? 'Type a name'"
        size="lg"
        class="flex-1"
        @keyup.enter="addPerson"
        @input="onInput"
      />
      <UButton
        icon="i-heroicons-plus"
        size="lg"
        :disabled="!inputText.trim()"
        @click="addPerson"
      >
        Add
      </UButton>
    </div>
    <!-- Contact suggestions -->
    <div v-if="props.contacts.length > 0" class="space-y-2">
      <span class="text-sm text-gray-500 dark:text-gray-400">Suggested contacts</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="contact in filteredContacts"
          :key="contact.id"
          type="button"
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
          @click="selectSuggestion(contact)"
        >
          <span class="w-5 h-5 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center text-xs font-semibold shrink-0">
            {{ contact.first_name.charAt(0).toUpperCase() }}
          </span>
          <span>{{ [contact.first_name, contact.last_name].filter(Boolean).join(' ') }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ contact.email }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
