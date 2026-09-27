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
        legend: {
          data: ['2022', '2023', '2024'],
          textStyle: {
            color: '#fff'
          }
        },
        xAxis: {
          type: 'category',
          data: this.data.months,
          axisLabel: {
            color: '#fff'
          }
        },
        yAxis: {
          axisLabel: {
            color: '#fff'
          }
        },
        series: [
          {
            name: '2022',
            type: 'line',
            data: this.data.y2022,
            smooth: true,
            itemStyle: {
              color: '#73c0de'
            }
          },
          {
            name: '2023',
            type: 'line',
            data: this.data.y2023,
            smooth: true,
            itemStyle: {
              color: '#fac858'
            }
          },
          {
            name: '2024',
            type: 'line',
            data: this.data.y2024,
            smooth: true,
            itemStyle: {
              color: '#ee6666'
            }
          }
        ]
      }
    }
  }
}
</script>
