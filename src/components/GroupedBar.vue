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
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['男性', '女性', '总数'],
          textStyle: {
            color: '#fff'
          }
        },
        xAxis: {
          type: 'category',
          data: this.data.categories,
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
            name: '男性',
            type: 'bar',
            data: this.data.male,
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '女性',
            type: 'bar',
            data: this.data.female,
            itemStyle: {
              color: '#ee6666'
            }
          },
          {
            name: '总数',
            type: 'bar',
            data: this.data.male.map((value, index) => value + this.data.female[index]),
            itemStyle: {
              color: '#91cc75'
            }
          }
        ]
      }
    }
  }
}
</script>
