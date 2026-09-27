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
      type: Array,
      required: true,
      validator: (value) => value.every(item => 'name' in item && 'value' in item)
    }
  },
  computed: {
    chartOption() {
      return {
        grid: {
          left: '28%',
          right: '10%',
          top: '2%',
          bottom: '30%'
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#fff',
            formatter: (value) => `${value}万`
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.1)'
            }
          }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          data: this.data.map(item => item.name),
          axisLabel: {
            color: '#fff',
            fontSize: 12,
            rich: {
              index: {
                color: '#7db2ff',
                width: 25,
                align: 'right',
                padding: [0, 10, 0, 0]
              }
            },
            formatter: (value, index) => `{index|${index + 1}} ${value}`
          },
          axisTick: {
            show: false
          }
        },
        series: [{
          type: 'bar',
          data: this.data.map(item => item.value),
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#37A2DA' },
              { offset: 1, color: '#71D5DE' }
            ])
          },
          label: {
            show: true,
            position: 'right',
            color: '#fff',
            formatter: '{c}万',
            fontSize: 12
          }
        }]
      }
    }
  }
}
</script>

<style scoped>
.chart {
  height: 100%;
  padding: 10px 0;
}
</style>
