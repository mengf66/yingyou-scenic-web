/**
 * 大屏图表主题：靛蓝底 + 鎏金 / 朱砂 / 松石 / 黛紫
 * 所有大屏图表通过 screenColors 与 axis() 等辅助函数取色，保证风格一致。
 */
import * as echarts from 'echarts'

export const C = {
  gold: '#d9b36a', // 鎏金
  goldLight: '#f0d9a2',
  goldDeep: '#a8823f',
  cinnabar: '#e0674f', // 朱砂（深底上略提亮，保证可读）
  jade: '#5fb3a1', // 松石
  azure: '#6f9fd8', // 石青
  violet: '#a58bc9', // 藕荷
  ochre: '#c98a5a', // 赭石
  sky: '#7fb8d9', // 天青
  text: '#ece3cd',
  text2: '#aab5cc',
  line: 'rgba(217,179,106,0.12)',
  bg: '#0b1530'
}

/** 系列配色（按顺序使用）：金、朱、松石、石青、藕荷、赭石、天青，相邻色相差明显 */
export const PALETTE = [C.gold, C.cinnabar, C.jade, C.azure, C.violet, C.ochre, C.sky]

/** 横向/纵向渐变 */
export const grad = (from, to, horizontal = false) =>
  new echarts.graphic.LinearGradient(0, horizontal ? 0 : 1, horizontal ? 1 : 0, 0, [
    { offset: 0, color: from },
    { offset: 1, color: to }
  ])

export const goldBar = (horizontal = true) => grad('rgba(168,130,63,0.35)', C.goldLight, horizontal)

/** 坐标轴通用样式 */
export const axis = (extra = {}) => ({
  axisLine: { lineStyle: { color: 'rgba(217,179,106,0.35)' } },
  axisTick: { show: false },
  axisLabel: { color: C.text2, fontSize: 11 },
  splitLine: { lineStyle: { color: C.line, type: 'dashed' } },
  nameTextStyle: { color: C.text2, fontSize: 11 },
  ...extra
})

export const tooltip = (extra = {}) => ({
  backgroundColor: 'rgba(11,21,48,0.94)',
  borderColor: 'rgba(217,179,106,0.55)',
  borderWidth: 1,
  padding: [8, 12],
  textStyle: { color: C.text, fontSize: 12 },
  extraCssText: 'border-radius:2px;box-shadow:0 8px 24px rgba(0,0,0,.45),inset 0 0 0 3px rgba(11,21,48,.9),inset 0 0 0 4px rgba(217,179,106,.18);',
  ...extra
})

export const legend = (extra = {}) => ({
  textStyle: { color: C.text2, fontSize: 11 },
  itemWidth: 10,
  itemHeight: 10,
  icon: 'roundRect',
  ...extra
})
