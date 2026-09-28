<template>
  <BaseChart :option="option" v-bind="$attrs" />
</template>

<script>
/**
 * 山西文旅地图（大屏中央）
 * 地市按热度着色，古城景区以金色涟漪点标注，太原到各古城画出游线飞线。
 * 原先中央是腾讯街道地图（与大屏风格不符、且需要 Key），改为 ECharts 矢量地图。
 */
import BaseChart from '../BaseChart.vue'
import { C, tooltip } from './theme'

// 经纬度来自公开地理信息，精度到 0.01°
const SPOTS = [
  { name: '平遥古城', value: [112.18, 37.2], heat: 98, pos: 'left' },
  { name: '云冈石窟', value: [113.13, 40.11], heat: 92 },
  { name: '五台山', value: [113.59, 39.01], heat: 95 },
  { name: '晋祠', value: [112.43, 37.71], heat: 80, pos: 'left' },
  { name: '乔家大院', value: [112.44, 37.38], heat: 78, pos: 'right' },
  { name: '王家大院', value: [111.93, 36.83], heat: 70, pos: 'left' },
  { name: '皇城相府', value: [112.53, 35.49], heat: 72 },
  { name: '壶口瀑布', value: [110.45, 36.15], heat: 86, pos: 'bottom' },
  { name: '悬空寺', value: [113.71, 39.66], heat: 84 },
  { name: '忻州古城', value: [112.73, 38.42], heat: 74 },
  { name: '榆次老城', value: [112.74, 37.69], heat: 68, pos: 'right' },
  { name: '绛州古城', value: [111.21, 35.62], heat: 60 }
]
const TAIYUAN = [112.55, 37.87]

export default {
  components: { BaseChart },
  props: {
    data: { type: Array, default: () => [] }
  },
  computed: {
    option() {
      return {
        tooltip: tooltip({
          trigger: 'item',
          formatter: p => (p.seriesType === 'effectScatter' ? `${p.name}<br/>热度指数：${p.data.heat}` : p.seriesType === 'map' ? `${p.name}<br/>客流热度：${p.value ?? '-'}` : '')
        }),
        visualMap: {
          show: false,
          min: 30,
          max: 100,
          seriesIndex: 0,
          inRange: { color: ['#15284f', '#1f3a6b', '#2d5088', '#3d67a3'] }
        },
        geo: {
          map: '山西',
          roam: false,
          layoutCenter: ['50%', '52%'],
          layoutSize: '104%',
          silent: true,
          itemStyle: {
            areaColor: 'transparent',
            borderColor: 'rgba(217,179,106,0.9)',
            borderWidth: 1.5,
            shadowColor: 'rgba(217,179,106,0.5)',
            shadowBlur: 18
          },
          z: 1
        },
        series: [
          {
            type: 'map',
            map: '山西',
            layoutCenter: ['50%', '52%'],
            layoutSize: '104%',
            roam: false,
            data: this.data,
            // 太原、晋中已有景点标注，地市名不再重复显示
            label: { show: true, color: 'rgba(169,180,204,0.55)', fontSize: 10, formatter: p => (['太原市', '晋中市'].includes(p.name) ? '' : p.name.replace('市', '')) },
            itemStyle: { borderColor: 'rgba(217,179,106,0.35)', borderWidth: 0.8 },
            emphasis: { label: { color: '#fff' }, itemStyle: { areaColor: '#4a78b8' } },
            select: { disabled: true },
            z: 2
          },
          {
            type: 'lines',
            coordinateSystem: 'geo',
            zlevel: 2,
            effect: { show: true, period: 5, trailLength: 0.5, symbol: 'circle', symbolSize: 3, color: C.goldLight },
            lineStyle: { color: C.gold, width: 1, opacity: 0.35, curveness: 0.25 },
            data: SPOTS.filter(s => s.name !== '晋祠').map(s => ({ coords: [TAIYUAN, s.value] }))
          },
          {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 3,
            rippleEffect: { brushType: 'stroke', scale: 3.5, period: 4 },
            symbolSize: d => 4 + (d[2] || 0) / 14,
            data: SPOTS.map(s => ({ name: s.name, value: [...s.value, s.heat], heat: s.heat, label: { position: s.pos || 'right' } })),
            itemStyle: { color: C.goldLight, shadowBlur: 10, shadowColor: C.gold },
            label: { show: true, position: 'right', formatter: '{b}', color: C.goldLight, fontSize: 11, textShadowColor: '#000', textShadowBlur: 4 }
          },
          {
            type: 'scatter',
            coordinateSystem: 'geo',
            zlevel: 3,
            symbol: 'pin',
            symbolSize: 26,
            data: [{ name: '太原', value: TAIYUAN }],
            itemStyle: { color: C.cinnabar },
            label: { show: true, formatter: '太原', position: 'top', distance: 2, color: '#fff', fontSize: 11, fontWeight: 600, textShadowColor: '#000', textShadowBlur: 4 }
          }
        ]
      }
    }
  }
}
</script>
