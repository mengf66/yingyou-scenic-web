<template>
  <div ref="chartDom" :style="{ width: width, height: height }"></div>
</template>

<script>
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  props: {
    option: Object,
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  setup(props) {
    const chartDom = ref(null)
    let chartInstance = null

    const initChart = () => {
      chartInstance = echarts.init(chartDom.value)
      chartInstance.setOption(props.option)
      window.addEventListener('resize', handleResize)
    }

    const handleResize = () => {
      chartInstance?.resize()
    }

    onMounted(initChart)

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance?.dispose()
    })

    return {
      chartDom
    }
  }
}
</script>
