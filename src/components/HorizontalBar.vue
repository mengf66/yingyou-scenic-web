<template>
  <BaseChart :option="option" v-bind="$attrs" />
</template>

<script>
import BaseChart from './BaseChart.vue'
import { C, axis, tooltip, goldBar } from './screen/theme'

export default {
  components: { BaseChart },
  props: ['data'],
  computed: {
    option() {
      return {
        tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' } }),
        grid: { top: 6, bottom: 6, left: 4, right: 48, containLabel: true },
        yAxis: axis({
          type: 'category',
          inverse: true,
          data: this.data.categories,
          axisLine: { show: false },
          axisLabel: { color: C.text, fontSize: 12 }
        }),
        xAxis: { type: 'value', show: false },
        series: [{
          type: 'bar',
          barWidth: 10,
          showBackground: true,
          backgroundStyle: { color: 'rgba(217,179,106,0.07)', borderRadius: 5 },
          label: {
            show: true,
            position: 'right',
            color: C.goldLight,
            fontSize: 12
          },
          // 前三名鎏金高亮，其余用淡蓝
          data: this.data.values.map((v, i) => ({
            value: v,
            itemStyle: { color: i < 3 ? goldBar() : 'rgba(111,159,216,0.7)', borderRadius: 5 }
          }))
        }]
      }
    }
  }
}
</script>
