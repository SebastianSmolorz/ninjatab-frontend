import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Currency } from '~/types'

export const useBillDraftStore = defineStore('billDraft', () => {
  const billType = ref<'single' | 'itemised' | null>(null)
  const description = ref('')
  const currency = ref(Currency.GBP)
  const paid_by_id = ref<string | null>(null)
  const line_items = ref<Array<{ description: string; value: number }>>([])
  const singleExpense = ref({ description: '', value: 0 })
  const splitModes = ref<Record<number, 'even' | 'custom'>>({})
  const splits = ref<Record<number, Record<string, number>>>({})

  function $reset() {
    billType.value = null
    description.value = ''
    currency.value = Currency.GBP
    paid_by_id.value = null
    line_items.value = []
    singleExpense.value = { description: '', value: 0 }
    splitModes.value = {}
    splits.value = {}
  }

  return {
    billType,
    description,
    currency,
    paid_by_id,
    line_items,
    singleExpense,
    splitModes,
    splits,
    $reset,
  }
})
