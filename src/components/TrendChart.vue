<template>
  <BaseChart :option="chartOption" class="chart" />
</template>

<script>
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

export default {
  components: { BaseChart },
  props: {
    data: {
      type: Object,
      required: true,
      validator: (value) => 'xAxis' in value && 'values' in value
    }
  },
  computed: {
    chartOption() {
      return {
        grid: {
          top: '25%',
          bottom: '25%',
          left: '10%',
          right: '10%'
        },
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#7db2ff'
            }
          },
          axisLabel: {
            color: '#fff',
            interval: 0
          },
          data: this.data.xAxis
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.1)'
            }
          },
          axisLabel: {
            color: '#fff'
          }
        },
        series: [{
          data: this.data.values,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#37A2DA'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(55,162,218,0.6)' },
              { offset: 1, color: 'rgba(55,162,218,0)' }
            ])
          }
        }]
      }
    }
  }
}
</script>
