<template>
  <BaseChart :option="option" v-bind="$attrs" />
</template>

<script>
import BaseChart from './BaseChart.vue'
import { C, axis, tooltip, legend } from './screen/theme'

const SERIES = [
  { key: 'y2022', name: '2022', color: C.azure },
  { key: 'y2023', name: '2023', color: C.jade },
  { key: 'y2024', name: '2024', color: C.gold }
]

export default {
  components: { BaseChart },
  props: ['data'],
  computed: {
    option() {
      const last = SERIES.length - 1
      return {
        tooltip: tooltip({ trigger: 'axis', valueFormatter: v => v + ' 万人次' }),
        legend: legend({ data: SERIES.map(s => s.name), top: 0, right: 0, icon: 'circle' }),
        grid: { top: 28, bottom: 4, left: 4, right: 10, containLabel: true },
        xAxis: axis({ type: 'category', boundaryGap: false, data: this.data.months, axisLabel: { color: C.text2, fontSize: 10, interval: 1 } }),
        yAxis: axis({ type: 'value', axisLine: { show: false } }),
        series: SERIES.map((s, i) => ({
          name: s.name,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: i === last,
          data: this.data[s.key],
          lineStyle: { width: i === last ? 2.5 : 1.5, color: s.color },
          itemStyle: { color: s.color },
          // 最新一年加面积，突出当前
          areaStyle: i === last
            ? { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(217,179,106,0.35)' }, { offset: 1, color: 'rgba(217,179,106,0)' }] } }
            : undefined
        }))
      }
    }
  }
}
</script>
