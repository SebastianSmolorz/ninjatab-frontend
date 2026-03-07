<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <UContainer class="py-3 max-w-2xl">
        <div class="flex items-center gap-2">
          <div
              :class="[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              step >= 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          ></div>
          <div
              :class="[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              step >= 2 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          ></div>
        </div>
      </Ucontainer>
    </div>

    <!-- Form container with slide animation -->
    <div class="flex-1 relative overflow-hidden">
      <Transition :name="slideDirection" mode="out-in">
        <!-- Step 1: Tab Name -->
        <div v-if="step === 1" key="step1" class="absolute inset-0 overflow-y-auto">
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
                    v-model="formData.name"
                    placeholder="e.g. Weekend in Berlin"
                    size="xl"
                    autofocus
                    @keyup.enter="nextStep"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <UTextarea
                    v-model="formData.description"
                    placeholder="Add more details about this tab..."
                    :rows="3"
                />
              </div>

              <div class="flex gap-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Currency
                  </label>
                  <CurrencySelect v-model="formData.default_currency" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    For creating new bills
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Settlement Currency
                  </label>
                  <CurrencySelect v-model="formData.settlement_currency" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Currency you want to change hands at the end
                  </p>
                </div>
              </div>
            </div>
          </UContainer>
        </div>

        <!-- Step 2: Add People -->
        <div v-else-if="step === 2" key="step2" class="absolute inset-0 overflow-y-auto">
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
                    v-for="(person, index) in formData.people"
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
                  v-if="formData.people.length < 1 || !hasValidPeople"
                  icon="i-heroicons-information-circle"
                  color="primary"
                  variant="soft"
                  title="Add at least one other person"
                  description="A tab needs at least one person besides you"
              />
              <UAlert
                  v-if="formData.people.length > 1 && hasDuplicateNames"
                  icon="i-heroicons-information-circle"
                  color="warning"
                  variant="soft"
                  title="Duplicated names"
                  description="All names need to be unique. You can change them above."
              />
            </div>
          </UContainer>
        </div>
      </Transition>
    </div>

    <!-- Footer actions - Fixed at bottom -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
      <UContainer class="py-4 max-w-2xl">
        <div class="flex gap-3">
          <UButton
              v-if="step === 2"
              @click="previousStep"
              variant="outline"
              size="lg"
              class="flex-1"
          >
            Back
          </UButton>
          <UButton
              v-if="step === 1"
              @click="nextStep"
              :disabled="!formData.name.trim()"
              size="lg"
              block
          >
            Continue
          </UButton>
          <UButton
              v-if="step === 2"
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
import {ref, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useTabStore} from '~/stores/tabs'
import {useAuthStore} from '~/stores/auth'
import {Currency} from '~/types'
import type {Contact} from '~/types'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const tabStore = useTabStore()
const authStore = useAuthStore()
const api = useApi()

// State
const step = ref(1)
const slideDirection = ref<'slide-left' | 'slide-right'>('slide-left')
const loading = ref(false)
const contacts = ref<Contact[]>([])

interface PersonEntry {
  name: string
  user_id?: string
  email?: string
}

const formData = ref({
  name: '',
  description: '',
  default_currency: Currency.GBP,
  settlement_currency: Currency.GBP,
  people: [{
    name: authStore.user?.first_name || '',
    email: authStore.user?.email,
  } as PersonEntry]
})

onMounted(async () => {
  try {
    contacts.value = await api.tabs.contacts()
  } catch {
    // Contacts are optional — proceed without them
  }
})

// Computed
const hasValidPeople = computed(() => {
  return formData.value.people.slice(1).some(p => p.name.trim().length > 0)
})

const hasDuplicateNames = computed(() => {
  const names = formData.value.people
      .map(p => p.name.trim().toLowerCase())
      .filter(n => n.length > 0)
  return new Set(names).size !== names.length
})


const canCreate = computed(() => {
  return formData.value.name.trim().length > 0 && hasValidPeople.value && !hasDuplicateNames.value
})

// Methods
const availableContacts = computed(() => {
  const selectedUserIds = new Set(
    formData.value.people
      .filter(p => p.user_id)
      .map(p => p.user_id)
  )
  return contacts.value.filter(c => !selectedUserIds.has(c.user_id))
})

const onAddPerson = (entry: PersonEntry) => {
  formData.value.people.push(entry)
}

const nextStep = () => {
  if (!formData.value.name.trim()) return
  slideDirection.value = 'slide-left'
  step.value = 2
}

const previousStep = () => {
  slideDirection.value = 'slide-right'
  step.value = 1
}

const removePerson = (index: number) => {
  if (formData.value.people.length > 1) {
    formData.value.people.splice(index, 1)
  }
}

const createTab = async () => {
  if (!canCreate.value) return

  loading.value = true

  try {
    // Filter out empty names; include user_id for the first person so TabPerson links to the logged-in user
    const validPeople = formData.value.people
        .filter(p => p.name.trim().length > 0)
        .map((p, index) => ({
          name: p.name.trim(),
          ...(index === 0 && authStore.user?.id ? {user_id: authStore.user.id} : {}),
          ...(index !== 0 && p.user_id ? {user_id: p.user_id} : {}),
        }))

    const newTab = await tabStore.createTab({
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      default_currency: formData.value.default_currency,
      settlement_currency: formData.value.settlement_currency,
      people: validPeople
    })

    // Navigate to the new tab
    router.push(`/tabs/${newTab.id}`)
  } catch (error) {
    console.error('Failed to create tab:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Slide left animation (forward) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Slide right animation (backward) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
