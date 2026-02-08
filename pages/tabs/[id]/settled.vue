<template>
  <div class="settled-page fixed inset-0 bg-gray-900 flex flex-col items-center overflow-y-auto z-50">
    <!-- Confetti layer -->
    <div class="confetti-container absolute inset-0 pointer-events-none">
      <div
        v-for="i in 50"
        :key="i"
        class="confetti-piece"
        :style="confettiStyle(i)"
      />
    </div>

    <!-- Radial pulse behind checkmark -->
    <div class="pulse-ring" />
    <div class="pulse-ring pulse-ring-2" />

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center text-center px-6 py-12 my-auto">
      <!-- Animated checkmark circle -->
      <div class="check-container">
        <svg class="checkmark" viewBox="0 0 100 100">
          <circle class="checkmark-circle" cx="50" cy="50" r="45" fill="none" stroke-width="3" />
          <path class="checkmark-check" d="M30 52 L44 66 L70 38" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <!-- Heading -->
      <h1 class="heading mt-8 text-4xl font-extrabold text-white">
        Tab split!
      </h1>
      <p class="subheading mt-2 text-lg text-gray-400">
        Time to pay up...or else
      </p>

      <!-- Settlement cards -->
      <div v-if="tab?.settlements?.length" class="settlements mt-10 w-full max-w-sm space-y-3">
        <div
          v-for="(settlement, idx) in tab.settlements"
          :key="settlement.id"
          class="settlement-card"
          :style="{ animationDelay: `${1.2 + idx * 0.15}s` }"
        >
          <div class="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <!-- From -->
            <div class="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-bold text-primary-400">
                {{ settlement.from_person.name.charAt(0).toUpperCase() }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 text-sm">
                <span class="font-semibold text-white truncate">{{ settlement.from_person.name }}</span>
                <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span class="font-semibold text-white truncate">{{ settlement.to_person.name }}</span>
              </div>
            </div>

            <!-- Amount -->
            <div class="text-right flex-shrink-0">
              <span class="text-lg font-bold text-green-400">
                {{ settlement.currency }} {{ settlement.amount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="cta mt-10">
        <UButton
          size="xl"
          icon="i-heroicons-arrow-left"
          variant="soft"
          @click="router.push(`/tabs/${route.params.id}`)"
        >
          Back to Tab
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '~/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()

const tab = computed(() => tabStore.currentTab)

const confettiColors = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
]

const confettiStyle = (i: number) => {
  const left = Math.random() * 100
  const delay = Math.random() * 3
  const duration = 2.5 + Math.random() * 2
  const color = confettiColors[i % confettiColors.length]
  const size = 6 + Math.random() * 6
  const rotation = Math.random() * 360

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    backgroundColor: color,
    width: `${size}px`,
    height: `${size * (Math.random() > 0.5 ? 1 : 2.5)}px`,
    transform: `rotate(${rotation}deg)`,
  }
}

onMounted(async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/')
    return
  }

  if (!tab.value) {
    await tabStore.fetchTabById(id)
  }
})
</script>

<style scoped>
/* Checkmark container */
.check-container {
  width: 120px;
  height: 120px;
  animation: check-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

@keyframes check-bounce {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

/* SVG checkmark */
.checkmark-circle {
  stroke: #3B82F6;
  stroke-dasharray: 283;
  stroke-dashoffset: 283;
  animation: circle-draw 0.6s ease-out 0.5s forwards;
}

@keyframes circle-draw {
  to { stroke-dashoffset: 0; }
}

.checkmark-check {
  stroke: #10B981;
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: check-draw 0.4s ease-out 0.9s forwards;
}

@keyframes check-draw {
  to { stroke-dashoffset: 0; }
}

/* Heading */
.heading {
  opacity: 0;
  animation: fade-up 0.5s ease-out 0.8s forwards;
}

.subheading {
  opacity: 0;
  animation: fade-up 0.5s ease-out 1s forwards;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Settlement cards */
.settlement-card {
  opacity: 0;
  animation: card-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes card-pop {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* CTA */
.cta {
  opacity: 0;
  animation: fade-up 0.5s ease-out 1.8s forwards;
}

/* Pulse rings */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  margin-top: -160px;
  margin-left: -100px;
  border-radius: 50%;
  border: 2px solid rgba(59, 130, 246, 0.3);
  animation: pulse-expand 2s ease-out 0.5s both;
  pointer-events: none;
}

.pulse-ring-2 {
  animation-delay: 0.8s;
}

@keyframes pulse-expand {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

/* Confetti */
.confetti-piece {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  opacity: 0;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    top: -5%;
    transform: translateX(0) rotate(0deg);
  }
  25% {
    opacity: 1;
    transform: translateX(30px) rotate(90deg);
  }
  50% {
    transform: translateX(-20px) rotate(180deg);
  }
  75% {
    transform: translateX(15px) rotate(270deg);
  }
  100% {
    opacity: 0;
    top: 105%;
    transform: translateX(-10px) rotate(360deg);
  }
}
</style>
