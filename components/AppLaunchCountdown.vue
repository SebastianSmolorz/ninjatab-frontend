<template>
  <div class="flex gap-4 justify-center">
    <div v-for="unit in units" :key="unit.label" class="flex flex-col items-center gap-1">
      <div class="text-3xl sm:text-4xl font-bold text-primary tabular-nums w-16 text-center">
        {{ unit.value }}
      </div>
      <div class="text-xs text-gray-400 uppercase tracking-widest">{{ unit.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const LAUNCH = new Date('2026-05-21T00:00:00Z')

function getTimeLeft() {
  const diff = Math.max(0, LAUNCH.getTime() - Date.now())
  return {
    days:    String(Math.floor(diff / 86_400_000)).padStart(2, '0'),
    hours:   String(Math.floor((diff % 86_400_000) / 3_600_000)).padStart(2, '0'),
    minutes: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0'),
    seconds: String(Math.floor((diff % 60_000) / 1_000)).padStart(2, '0'),
  }
}

const time = ref(getTimeLeft())

const units = computed(() => [
  { label: 'days',    value: time.value.days },
  { label: 'hours',   value: time.value.hours },
  { label: 'minutes', value: time.value.minutes },
  { label: 'seconds', value: time.value.seconds },
])

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => { time.value = getTimeLeft() }, 1000)
})

onUnmounted(() => clearInterval(timer))
</script>
