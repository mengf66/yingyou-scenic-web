<template>
  <div class="stats-grid">
    <div
        v-for="(item, index) in stats"
        :key="index"
        class="stat-item"
        :style="index === stats.length - 1 ? { width: '90%' } : { width: '17%', marginBottom: '10px' }"
    >
      <div class="stat-title">{{ item.title }}</div>
      <div class="stat-value">{{ item.value }}</div>
      <div v-if="item.trend" :class="['stat-trend', item.trend]">
        <span v-if="item.trend === 'up'">↑</span>
        <span v-else>↓</span>
        {{ item.rate }}%
      </div>
      <!-- 无同比数据（如"当前游客"）时显示实时标记，避免出现 "↓ undefined%" -->
      <div v-else class="stat-trend">实时</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['stats']
}
</script>

<style>
.stats-grid {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 15px;
  border-radius: 6px;
  text-align: center;
}

.stat-title {
  color: #7ec2f3;
  font-size: 0.8em;
}

.stat-value {
  color: #fff;
  font-size: 1em;
  margin: 5px 0;
}

.stat-trend.up {
  color: #90ee90;
}

.stat-trend.down {
  color: #ff6b6b;
}
</style>
