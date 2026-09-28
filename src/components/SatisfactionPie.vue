<template>
  <div class="satisfaction-grid">
    <div v-for="(item, index) in data" :key="index" class="pie-item">
      <BaseChart :option="getOption(item, index)" class="chart" />
      <div class="label">{{ item.name.replace('满意度', '') }}</div>
    </div>
  </div>
</template>

<script>
import BaseChart from './BaseChart.vue'
import { C, PALETTE, grad } from './screen/theme'

export default {
  components: { BaseChart },
  props: ['data'],
  methods: {
    getOption(item, index) {
      const color = PALETTE[index % PALETTE.length]
      return {
        series: [{
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          radius: '88%',
          pointer: { show: false },
          progress: {
            show: true,
            roundCap: true,
            width: 7,
            itemStyle: { color: grad(color, C.goldLight) }
          },
          axisLine: { lineStyle: { width: 7, color: [[1, 'rgba(217,179,106,0.1)']] } },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          detail: {
            offsetCenter: [0, 0],
            formatter: '{value}%',
            color: C.text,
            fontSize: 17,
            fontWeight: 600
          },
          data: [{ value: item.value }]
        }]
      }
    }
  }
}
</script>

<style scoped>
.satisfaction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 4px 8px;
  height: 100%;
}

.pie-item {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.pie-item .chart {
  flex: 1;
  min-height: 0;
}

.label {
  text-align: center;
  color: var(--screen-text-2);
  font-size: 12px;
  letter-spacing: 1px;
  padding-bottom: 2px;
}
</style>
