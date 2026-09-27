<template>
  <div class="online-pie-container">
    <BaseChart :option="chartOption" class="pie-chart" />
    <div class="data-display">
      <div class="value">{{ value }}万元</div>
      <div :class="['rate', rate > 0 ? 'up' : 'down']">{{ rate > 0 ? '+' : '' }}{{ rate }}%
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

export default {
  components: { BaseChart },
  props: {
    value: Number,
    rate: Number,
    // 线上 + 线下总额（万元），用于计算占比；原代码只有一个数据项，饼图恒显示 100%
    total: { type: Number, default: 100 }
  },
  computed: {
    chartOption() {
      return {
        series: [{
          type: 'pie',
          radius: ['30%', '35%'],
          center: ['50%', '60%'],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#37A2DA' },
              { offset: 1, color: '#71D5DE' }
            ])
          },
          label: {
            show: true,
            position: 'center',
            formatter: () => (this.total ? Math.round((this.value / this.total) * 100) : 0) + '%',
            fontSize: 24,
            color: '#fff'
          },
          data: [
            { value: this.value },
            { value: Math.max(0, this.total - this.value), itemStyle: { color: 'rgba(45,75,122,0.35)' }, label: { show: false }, emphasis: { disabled: true } }
          ]
        }]
      }
    }
  }
}
</script>

<style scoped>
.online-pie-container {
  display: flex;
  height: 20%;
  align-items: center;
}

.pie-chart {
  width: 20%;
  height: 50%;
}

.data-display {
  padding-left: 20px;
}

.value {
  font-size: 18px;
  color: #fff;
  margin-bottom: 8px;
}

.rate {
  font-size: 14px;
}

.up {
  color: #6dd230;
}

.down {
  color: #ff4d4d;
}
</style>
