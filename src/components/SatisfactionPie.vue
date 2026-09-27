<template>
  <div class="satisfaction-grid">
    <div v-for="(item, index) in data" :key="index" class="pie-item">
      <BaseChart :option="getOption(item, index)" class="chart" />
      <div class="label">{{ item.name }}</div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

const colorList = [
  ['#37A2DA', '#71D5DE'],
  ['#32C5E9', '#67E0E3'],
  ['#9FE6B8', '#96E6E6'],
  ['#FFDB5C', '#F7D674'],
  ['#FF9F7F', '#FB7293'],
  ['#E062AE', '#E690D1']
]

export default {
  components: { BaseChart },
  props: ['data'],
  methods: {
    getOption(item, index) {
      return {
        title: {
          show: false
        },
        tooltip: {
          show: false
        },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['50%', '50%'],
          data: [{
            value: item.value,
            name: item.name,
            label: {
              show: true,
              position: 'center',
              formatter: '{c}%',
              color: '#fff',
              fontSize: 18,
              fontWeight: 'bold'
            }
          }],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorList[index][0] },
              { offset: 1, color: colorList[index][1] }
            ])
          }
        }]
      }
    }
  }
}
</script>

<style scoped>
.satisfaction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  height: 95%;
  padding: 5px;
}

.pie-item {
  position: relative;
  height: 80px;
}

.pie-item .chart {
  height: 140px !important;
}

.label {
  text-align: center;
  color: #fff;
  font-size: 12px;
  margin-top: 3px;
  padding: 0 5px;
  line-height: 1.2;
  height: 25px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
