<template>
  <div>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="person in people"
        :key="person.id"
        class="flex flex-col items-center"
      >
        <!-- Name button (toggles selection) -->
        <UButton
          :variant="isSelected(person.id) ? 'solid' : 'outline'"
          size="sm"
          color="secondary"
          block
          @click="togglePerson(person.id)"
          class="w-26 h-12 justify-center"
        >
          {{ person.name }}
        </UButton>

        <!-- Shares counter (shown when selected) -->
        <div v-if="isSelected(person.id)" class="flex items-center gap-1 mt-1">
          <UButton
            variant="ghost"
            size="xs"
            icon="i-heroicons-minus"
            @click="decrement(person.id)"
          />
          <span class="text-sm font-medium text-primary-700 dark:text-primary-300 min-w-[1.5rem] text-center">
            {{ modelValue[person.id] }}
          </span>
          <UButton
            variant="ghost"
            size="xs"
            icon="i-heroicons-plus"
            @click="increment(person.id)"
          />
        </div>
      </div>
    </div>

    <!-- Calculated amounts summary -->
    <div v-if="hasAnySplits" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
      <div
        v-for="person in people"
        :key="'amount-' + person.id"
        v-show="modelValue[person.id] > 0"
        class="flex justify-between text-xs text-gray-500 dark:text-gray-400"
      >
        <span>{{ person.name }}</span>
        <span>{{ calculateAmount(person.id) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Person {
  id: number
  name: string
}

const props = defineProps<{
  people: Person[]
  modelValue: Record<number, number>
  itemValue: number
  formatCurrency: (amount: number) => string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<number, number>]
}>()

const isSelected = (personId: number) => {
  return (props.modelValue[personId] || 0) > 0
}

const hasAnySplits = computed(() => {
  return Object.values(props.modelValue).some(v => v > 0)
})

const updateValue = (personId: number, value: number) => {
  emit('update:modelValue', { ...props.modelValue, [personId]: value })
}

const togglePerson = (personId: number) => {
  if (isSelected(personId)) {
    updateValue(personId, 0)
  } else {
    updateValue(personId, 1)
  }
}

const increment = (personId: number) => {
  updateValue(personId, (props.modelValue[personId] || 0) + 1)
}

const decrement = (personId: number) => {
  const current = props.modelValue[personId] || 0
  if (current > 0) {
    updateValue(personId, current - 1)
  }
}

const calculateAmount = (personId: number): string => {
  const personShares = props.modelValue[personId] || 0
  const totalShares = Object.values(props.modelValue).reduce((sum, s) => sum + (s || 0), 0)

  if (totalShares === 0 || personShares === 0) return props.formatCurrency(0)

  const amount = (props.itemValue * personShares) / totalShares
  return props.formatCurrency(amount)
}
</script>
