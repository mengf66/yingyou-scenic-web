<template>
  <div class="time-weather">
    <span class="current-time">{{ currentTime }}</span>
    <img :src="weatherIcon" class="weather-icon" alt="晴" />
    <span class="temperature">{{ temperature }}℃</span>
    <span class="air-quality">AQI {{ aqi }} 优</span>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const currentTime = ref('')
    const weatherIcon = ref(import.meta.env.BASE_URL + 'sunny.svg')
    const temperature = ref(26)
    const aqi = ref(45)
    let timer = null

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    onMounted(() => {
      updateTime()
      timer = setInterval(updateTime, 1000)
    })
    onBeforeUnmount(() => clearInterval(timer))

    return {
      currentTime,
      weatherIcon,
      temperature,
      aqi
    }
  }
}
</script>

<style scoped>
.time-weather {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  white-space: nowrap;
}

.current-time {
  font-family: var(--font-num);
  color: var(--screen-text);
  letter-spacing: 0.5px;
}

.weather-icon {
  width: 18px;
  height: 18px;
}

.temperature {
  color: var(--jin-light);
}

.air-quality {
  color: #5fb3a1;
}
</style>
