<script setup lang="ts">
import type { Contact } from '~/types'

export interface PersonItem {
  label: string
  user_id?: string
}

const props = defineProps<{
  modelValue: PersonItem | null
  contacts: Contact[]
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PersonItem]
}>()

const items = computed(() =>
  props.contacts.map(c => ({
    label: [c.first_name, c.last_name].filter(Boolean).join(' '),
    user_id: c.user_id,
  }))
)

const open = ref(false)

// USelectMenu with value-key="label" emits/receives the label string.
// We convert between string (for USelectMenu) and PersonItem (for parent).
const selected = computed({
  get: () => props.modelValue?.label,
  set: (label) => {
    if (!label) return
    // Look up the full item to preserve user_id
    const match = items.value.find(i => i.label === label)
    emit('update:modelValue', match ?? { label })
  },
})


function onCreate(name: string) {
  open.value = false
  emit('update:modelValue', { label: name })
}
</script>

<template>
  <USelectMenu
    v-model="selected"
    :items="items"
    value-key="label"
    label-key="label"
    :placeholder="placeholder ?? 'Type name or select a contact'"
    :disabled="disabled"
    :loading="loading"
    :size="size"
    :search-input="{ placeholder: 'Type name or select a contact' }"
    create-item="always"
    v-model:open="open"
    @create="onCreate"
  >
    <template #item-leading="{ item }">
      <div
        class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0"
      >
        <span class="text-xs font-semibold text-primary-700 dark:text-primary-300">
          {{ item.label.charAt(0).toUpperCase() }}
        </span>
      </div>
    </template>
    <template #empty>
      No contacts. Just type their name
    </template>
  </USelectMenu>
</template>
