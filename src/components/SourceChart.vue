<template>
  <div class="source-chart">
    <div v-for="(item, index) in data" :key="index" class="ring-item">
      <BaseChart :option="getRingOption(item)" class="ring" />
      <div class="label">{{ item.name }}</div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

export default {
  components: { BaseChart },
  props: {
    data: {
      type: Array,
      required: true,
      validator: (value) => value.every(item => 'name' in item && 'value' in item)
    }
  },
  methods: {
    getRingOption(item) {
      return {
        animationDuration: 2000,
        animationEasing: 'cubicOut',
        series: [{
          type: 'pie',
          radius: ['60%', '80%'],
          startAngle: 225,
          avoidLabelOverlap: false,
          data: [
            {
              value: item.value,
              name: item.name,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#37A2DA' },
                  { offset: 1, color: '#71D5DE' }
                ])
              }
            },
            {
              value: 100 - item.value,
              itemStyle: {
                color: 'rgba(255,255,255,0.05)'
              }
            }
          ],
          label: {
            show: true,
            position: 'center',
            formatter: ({ percent }) => `${percent.toFixed(0)}%`,
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold'
          },
          labelLine: {
            show: false
          }
        }]
      }
    }
  }
}
</script>

<style scoped>
.source-chart {
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding: 15px;
}

.ring-item {
  position: relative;
  width: 18%;
  height: 100%;
}

.ring {
  height: 120px !important;
}

.label {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  color: #c6c7f1;
  font-size: 12px;
}
</style>
