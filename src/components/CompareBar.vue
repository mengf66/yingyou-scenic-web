<template>
  <BaseChart :option="option" v-bind="$attrs" />
</template>

<script>
import BaseChart from './BaseChart.vue'

export default {
  components: { BaseChart },
  props: ['data'],
  computed: {
    option() {
      return {
        grid: {
          top: '20%'
        },
        title: [{
          text: '单位：万人',
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          top: 5,
          left: 0
        }],
        legend: {
          data: ['去年', '今年'],
          textStyle: {
            color: '#fff'
          },
          top: 25
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          axisLabel: {
            color: '#fff',
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#fff',
            formatter: (value) => (value / 10000).toFixed(1)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.1)'
            }
          }
        },
        series: [
          {
            name: '去年',
            type: 'bar',
            data: this.data.lastYear,
            itemStyle: {
              color: '#5470c6'
            },
            barWidth: '30%'
          },
          {
            name: '今年',
            type: 'bar',
            data: this.data.currentYear,
            itemStyle: {
              color: '#ee6666'
            },
            barWidth: '30%'
          }
        ]
      }
    }
  }
}
</script>
