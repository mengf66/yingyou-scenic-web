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
        visualMap: {
          min: 0,
          max: 100,
          left: 'right',
          textStyle: {
            color: '#fff'
          },
          inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8']
          }
        },
        series: [{
          type: 'map',
          map: '山西',
          roam: true,
          label: {
            show: true,
            color: '#fff'
          },
          data: [
            { name: '太原市', value: 95 },
            { name: '大同市', value: 83 },
            { name: '阳泉市', value: 65 },
            { name: '长治市', value: 78 },
            { name: '晋城市', value: 72 },
            { name: '朔州市', value: 68 },
            { name: '晋中市', value: 88 },
            { name: '运城市', value: 92 },
            { name: '忻州市', value: 81 },
            { name: '临汾市', value: 85 },
            { name: '吕梁市', value: 76 }
          ]
        }]
      }
    }
  }
}
</script>
