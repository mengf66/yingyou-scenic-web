<template>
  <div ref="chartDom" :style="{ width: width, height: height }"></div>
</template>

<script>
import * as echarts from 'echarts'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export default {
  props: {
    option: Object,
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    }
  },
  setup(props) {
    const chartDom = ref(null)
    let chartInstance = null
    let observer = null

    const initChart = () => {
      chartInstance = echarts.init(chartDom.value)
      chartInstance.setOption(props.option)
      // 跟随容器尺寸变化（网格布局下，窗口不变时容器也可能变化）
      observer = new ResizeObserver(() => chartInstance?.resize())
      observer.observe(chartDom.value)
    }

    watch(() => props.option, opt => chartInstance?.setOption(opt, true), { deep: true })

    onMounted(initChart)

    onBeforeUnmount(() => {
      observer?.disconnect()
      chartInstance?.dispose()
    })

    return {
      chartDom
    }
  }
}
</script>
