<template>
  <div class="today-stats">
    <div class="stat-item">
      <div class="label">今日成交总额</div>
      <div class="value">{{ data.amount }}<span class="unit">元</span></div>
    </div>
    <div class="stat-item">
      <div class="label">今日成交数</div>
      <div class="value">{{ data.count }}<span class="unit">个</span></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data']
}
</script>

<style scoped>
.today-stats {
  position: absolute;
  top: -20px;
  height: 100%;
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
}

.stat-item {
  margin: 15px 0;
}

.label {
  color: #8c9eb5;
  font-size: 14px;
  margin-bottom: 8px;
}

.value {
  font-size: 24px;
  color: #7db2ff;
  display: flex;
  align-items: baseline;
}

.unit {
  font-size: 14px;
  color: #8c9eb5;
  margin-left: 5px;
}
</style>
