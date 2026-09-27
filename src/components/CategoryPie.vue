<template>
  <BaseChart :option="chartOption" class="chart" />
</template>

<script>
import BaseChart from './BaseChart.vue'

export default {
  components: { BaseChart },
  props: ['data'],
  computed: {
    chartOption() {
      return {
        tooltip: {
          trigger: 'item'
        },
        center: ['55%', '85%'],
        legend: {
          orient: 'vertical',
          right: 10,
          top: '50px',
          textStyle: {
            color: '#fff'
          }
        },
        series: [{
          type: 'pie',
          radius: '40%',
          data: this.data,
          label: {
            color: '#fff',
            formatter: '{b}: {d}%',
            overflow: 'none'
          },
          itemStyle: {
            borderRadius: 5,
            borderColor: '#0a1d3a',
            borderWidth: 2
          }
        }]
      }
    }
  }
}
</script>

<style scoped>
.chart {
  top: -40px;
  height: 100%;
}
</style>
