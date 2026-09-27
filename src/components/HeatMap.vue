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
          trigger: 'item',
          formatter: p => `${p.name}<br/>热度指数：${p.value ?? '-'}`
        },
        visualMap: {
          min: 0,
          max: 100,
          left: 0,
          bottom: 0,
          itemWidth: 10,
          itemHeight: 70,
          calculable: true,
          text: ['高', '低'],
          textStyle: { color: '#a8c7ff' },
          inRange: {
            color: ['#50a3ba', '#eac736', '#d94e5d']
          }
        },
        series: [{
          type: 'map',
          map: '山西',
          layoutCenter: ['55%', '50%'],
          layoutSize: '95%',
          data: this.data.coordinates,
          itemStyle: { borderColor: '#0a1d3a', borderWidth: 1 },
          emphasis: { label: { color: '#fff' }, itemStyle: { areaColor: '#3b7ad9' } },
          label: {
            show: true,
            color: '#fff',
            fontSize: 9,
            formatter: p => p.name.replace('市', '')
          }
        }]
      }
    }
  }
}
</script>
