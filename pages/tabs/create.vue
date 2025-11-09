<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Progress indicator -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-2xl mx-auto px-4 py-3">
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
      </div>
    </div>

    <!-- Form container with slide animation -->
    <div class="flex-1 relative overflow-hidden">
      <Transition :name="slideDirection" mode="out-in">
        <!-- Step 1: Tab Name -->
        <div v-if="step === 1" key="step1" class="absolute inset-0 overflow-y-auto">
          <div class="max-w-2xl mx-auto px-4 py-8">
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
                  placeholder="e.g., Weekend Trip, Dinner Party"
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
            </div>
          </div>
        </div>

        <!-- Step 2: Add People -->
        <div v-else-if="step === 2" key="step2" class="absolute inset-0 overflow-y-auto">
          <div class="max-w-2xl mx-auto px-4 py-8">
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
                  <UInput
                    v-model="person.name"
                    :placeholder="`Person ${index + 1} name`"
                    size="lg"
                    class="flex-1"
                    :autofocus="index === formData.people.length - 1"
                    @keyup.enter="addPerson"
                  />
                  <UButton
                    v-if="formData.people.length > 1"
                    @click="removePerson(index)"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    size="lg"
                  />
                </div>
              </div>

              <!-- Add person button -->
              <UButton
                @click="addPerson"
                variant="outline"
                icon="i-heroicons-plus"
                block
                size="lg"
              >
                Add Another Person
              </UButton>

              <UAlert
                v-if="formData.people.length < 1 || !hasValidPeople"
                icon="i-heroicons-information-circle"
                color="primary"
                variant="soft"
                title="At least one person is required"
                description="Add at least one person with a name to continue"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Footer actions - Fixed at bottom -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
      <div class="max-w-2xl mx-auto px-4 py-4">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'
import { Currency } from '~/types'

const router = useRouter()
const tabStore = useTabStore()

// State
const step = ref(1)
const slideDirection = ref<'slide-left' | 'slide-right'>('slide-left')
const loading = ref(false)

const formData = ref({
  name: '',
  description: '',
  people: [{ name: '' }]
})

// Computed
const hasValidPeople = computed(() => {
  return formData.value.people.some(p => p.name.trim().length > 0)
})

const canCreate = computed(() => {
  return formData.value.name.trim().length > 0 && hasValidPeople.value
})

// Methods
const nextStep = () => {
  if (!formData.value.name.trim()) return
  slideDirection.value = 'slide-left'
  step.value = 2
}

const previousStep = () => {
  slideDirection.value = 'slide-right'
  step.value = 1
}

const addPerson = () => {
  formData.value.people.push({ name: '' })
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
    // Filter out empty names
    const validPeople = formData.value.people
      .filter(p => p.name.trim().length > 0)
      .map(p => ({ name: p.name.trim() }))

    const newTab = await tabStore.createTab({
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      default_currency: Currency.GBP,
      people: validPeople
    })

    // Navigate to the new tab
    router.push(`/tabs/${newTab.id}`)
  } catch (error) {
    console.error('Failed to create tab:', error)
    // TODO: Show error notification
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
