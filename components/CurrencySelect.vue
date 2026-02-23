<script setup lang="ts">
import { Currency } from '~/types'

const CURRENCY_OPTIONS = [
  { value: Currency.USD, label: 'US Dollar',      symbol: '$'   },
  { value: Currency.EUR, label: 'Euro',            symbol: '€'   },
  { value: Currency.GBP, label: 'British Pound',   symbol: '£'   },
  { value: Currency.JPY, label: 'Japanese Yen',    symbol: '¥'   },
  { value: Currency.CAD, label: 'Canadian Dollar', symbol: 'C$' },
  { value: Currency.TRY, label: 'Turkish Lira',    symbol: '₺'   },
  { value: Currency.PLN, label: 'Polish Złoty',    symbol: 'zł'  },
  { value: Currency.CZK, label: 'Czech Koruna',    symbol: 'Kč'  },
]

const props = defineProps<{
  modelValue: string | null
  size?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const selected = computed({
  get: () => CURRENCY_OPTIONS.find(o => o.value === props.modelValue) ?? null,
  set: (val) => { if (val) emit('update:modelValue', val.value) },
})
</script>

<template>
  <USelectMenu
    v-model="selected"
    :items="CURRENCY_OPTIONS"
    label-key="label"
    :search-input="{ placeholder: 'Search currencies...' }"
    :filter-fields="['label', 'value']"
    :size="size"
  >
    <template #leading>
      <span v-if="selected" class="text-sm font-medium w-6 text-center inline-block">
        {{ selected.symbol }}
      </span>
    </template>
    <template #item-leading="{ item }">
      <span class="text-sm font-medium w-6 text-center inline-block">{{ item.symbol }}</span>
    </template>
  </USelectMenu>
</template>
