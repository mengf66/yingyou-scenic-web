<template>
  <BaseChart :option="option" v-bind="$attrs" />
</template>

<script>
import BaseChart from './BaseChart.vue'
import { C, axis, tooltip, legend, grad } from './screen/theme'

export default {
  components: { BaseChart },
  props: ['data'],
  computed: {
    option() {
      return {
        tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' } }),
        legend: legend({ data: ['男性', '女性'], top: 0, right: 0 }),
        grid: { top: 26, bottom: 4, left: 4, right: 8, containLabel: true },
        xAxis: axis({ type: 'category', data: this.data.categories }),
        yAxis: axis({ type: 'value', axisLine: { show: false } }),
        series: [
          {
            name: '男性',
            type: 'bar',
            barWidth: 8,
            barGap: '30%',
            data: this.data.male,
            itemStyle: { color: grad('rgba(111,159,216,0.3)', C.azure), borderRadius: [4, 4, 0, 0] }
          },
          {
            name: '女性',
            type: 'bar',
            barWidth: 8,
            data: this.data.female,
            itemStyle: { color: grad('rgba(217,96,76,0.3)', C.cinnabar), borderRadius: [4, 4, 0, 0] }
          }
        ]
      }
    }
  }
}
</script>
