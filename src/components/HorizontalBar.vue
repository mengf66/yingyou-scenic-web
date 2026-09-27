<template>
  <BaseChart :option="option" v-bind="$attrs" />
</template>

<script>
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

export default {
  components: { BaseChart },
  props: ['data'],
  computed: {
    option() {
      return {
        grid: {
          top: '15%',
          bottom: '15%',
          left: '18%',
          right: '10%'
        },
        yAxis: {
          type: 'category',
          data: this.data.categories,
          axisLabel: {
            color: '#fff',
            fontSize: 12,
            width: 100,
            overflow: 'break'
          },
          axisTick: {
            show: false
          }
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#fff',
            fontSize: 10
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.1)'
            }
          }
        },
        series: [{
          type: 'bar',
          label: {
            show: true,
            position: 'right',
            color: '#fff',
            fontSize: 12,
            formatter: '{@score}',
            rich: {
              score: {
                verticalAlign: 'middle',
                padding: [0, 0, 0, 10]
              }
            }
          },
          barWidth: 16,
          data: this.data.values,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#37A2DA' },
              { offset: 1, color: '#71D5DE' }
            ])
          }
        }]
      }
    }
  }
}
</script>
