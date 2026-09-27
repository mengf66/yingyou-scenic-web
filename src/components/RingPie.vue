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
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#fff'
          }
        },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          data: this.data.data,
          label: {
            color: '#fff'
          },
          itemStyle: {
            borderColor: '#0a1d3a',
            borderWidth: 3
          }
        }]
      }
    }
  }
}
</script>
