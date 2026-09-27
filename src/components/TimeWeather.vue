<template>
  <div class="time-weather">
    <div class="current-time">{{ currentTime }}</div>
    <div class="weather-info">
      <img :src="weatherIcon" class="weather-icon" />
      <span class="temperature">{{ temperature }}℃</span>
      <span class="air-quality">AQI {{ aqi }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const currentTime = ref('')
    const weatherIcon = ref('/sunny.svg')
    const temperature = ref(26)
    const aqi = ref(45)

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    onMounted(() => {
      updateTime()
      const timer = setInterval(updateTime, 1000)
      onBeforeUnmount(() => clearInterval(timer))
    })

    return {
      currentTime,
      weatherIcon,
      temperature,
      aqi
    }
  }
}
</script>

<style>
.time-weather {
  padding: 15px;
  text-align: center;
}

.current-time {
  color: #7ec2f3;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.weather-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.weather-icon {
  width: 40px;
  height: 40px;
}

.temperature {
  color: gold;
}

.air-quality {
  color: #90ee90;
}
</style>
