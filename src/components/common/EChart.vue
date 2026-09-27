<template>
  <div ref="el" :style="{ width, height }"></div>
</template>

<script setup>
/** 管理页通用图表：option 变化自动重绘，容器尺寸变化自动 resize */
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const props = defineProps({
  option: { type: Object, required: true },
  width: { type: String, default: '100%' },
  height: { type: String, default: '300px' }
})
const emit = defineEmits(['click'])

const el = ref()
const chart = shallowRef()
let ro

onMounted(() => {
  chart.value = echarts.init(el.value)
  chart.value.setOption(props.option)
  chart.value.on('click', p => emit('click', p))
  ro = new ResizeObserver(() => chart.value && chart.value.resize())
  ro.observe(el.value)
})

watch(() => props.option, opt => chart.value && chart.value.setOption(opt, true), { deep: true })

onBeforeUnmount(() => {
  ro && ro.disconnect()
  chart.value && chart.value.dispose()
})
</script>
