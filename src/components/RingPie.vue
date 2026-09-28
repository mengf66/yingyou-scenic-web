<template>
  <BaseChart :option="option" v-bind="$attrs" />
</template>

<script>
import BaseChart from './BaseChart.vue'
import { C, PALETTE, tooltip, legend } from './screen/theme'

export default {
  components: { BaseChart },
  props: ['data'],
  computed: {
    option() {
      const total = this.data.data.reduce((s, d) => s + d.value, 0)
      return {
        color: PALETTE,
        tooltip: tooltip({ trigger: 'item', formatter: '{b}：{d}%' }),
        legend: legend({
          orient: 'vertical',
          right: 4,
          top: 'middle',
          itemGap: 12,
          formatter: name => {
            const d = this.data.data.find(x => x.name === name)
            return `${name}  ${Math.round((d.value / total) * 100)}%`
          }
        }),
        series: [{
          type: 'pie',
          radius: ['52%', '74%'],
          center: ['32%', '50%'],
          data: this.data.data,
          label: {
            show: true,
            position: 'center',
            formatter: '消费\n业态',
            color: C.goldLight,
            fontSize: 14,
            lineHeight: 18
          },
          emphasis: { label: { show: true, formatter: '{b}\n{d}%', fontSize: 15 } },
          labelLine: { show: false },
          itemStyle: { borderColor: '#101d3f', borderWidth: 3 }
        }]
      }
    }
  }
}
</script>
