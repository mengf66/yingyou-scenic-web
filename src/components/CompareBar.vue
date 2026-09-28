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
        tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => (v / 10000).toFixed(2) + ' 万人' }),
        legend: legend({ data: ['去年', '今年'], top: 0, right: 0 }),
        grid: { top: 30, bottom: 4, left: 4, right: 8, containLabel: true },
        xAxis: axis({
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          axisLabel: { color: C.text2, fontSize: 10, interval: 1 }
        }),
        yAxis: axis({
          type: 'value',
          name: '万人',
          axisLine: { show: false },
          axisLabel: { color: C.text2, fontSize: 10, formatter: v => (v / 10000).toFixed(1) }
        }),
        series: [
          {
            name: '去年',
            type: 'bar',
            barWidth: 6,
            barGap: '40%',
            data: this.data.lastYear,
            itemStyle: { color: 'rgba(111,159,216,0.55)', borderRadius: [3, 3, 0, 0] }
          },
          {
            name: '今年',
            type: 'bar',
            barWidth: 6,
            data: this.data.currentYear,
            itemStyle: { color: grad('rgba(168,130,63,0.4)', C.goldLight), borderRadius: [3, 3, 0, 0] }
          }
        ]
      }
    }
  }
}
</script>
