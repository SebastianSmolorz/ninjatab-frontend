import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Currency } from '~/types'
import type { Contact } from '~/types'
import { useAuthStore } from '~/stores/auth'

export interface PersonEntry {
  name: string
  user_id?: string
  email?: string
}

export const useTabDraftStore = defineStore('tabDraft', () => {
  const name = ref('')
  const description = ref('')
  const default_currency = ref(Currency.GBP)
  const settlement_currency = ref(Currency.GBP)
  const people = ref<PersonEntry[]>([])
  const contacts = ref<Contact[]>([])

  function $reset() {
    const authStore = useAuthStore()
    name.value = ''
    description.value = ''
    default_currency.value = Currency.GBP
    settlement_currency.value = Currency.GBP
    people.value = [{
      name: authStore.user?.first_name || '',
      email: authStore.user?.email,
    }]
    contacts.value = []
  }

  return {
    name,
    description,
    default_currency,
    settlement_currency,
    people,
    contacts,
    $reset,
  }
})
