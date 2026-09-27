<template>
  <div class="shop-chart-container">
    <div ref="chart" class="chart"></div>
    <div class="chart-center">
      <div class="chart-title">店铺数量</div>
      <div class="color-dot">
        <div class="inner-content">
          <div class="amount">{{ amount }}</div>
          <div class="unit">万元</div>
        </div>
      </div>
      <div class="category">{{ data.label }}</div>
      <div class="count">{{ data.value }}家</div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      staticAmounts: {
        酒店: 1200,
        餐饮: 860,
        旅拍: 450
      }
    }
  },
  computed: {
    amount() {
      return this.staticAmounts[this.data.label] || 0
    },
    gradientColor() {
      return {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.8,
        colorStops: [
          { offset: 0, color: this.lightenColor(this.data.color, 40) },
          { offset: 1, color: this.data.color }
        ]
      }
    }
  },
  mounted() {
    this.initChart()
  },
  beforeUnmount() {
    // 原代码未移除 resize 监听、未销毁实例，切换标签页后会内存泄漏并报错
    window.removeEventListener('resize', this.onResize)
    this.chart && this.chart.dispose()
  },
  methods: {
    initChart() {
      const chart = echarts.init(this.$refs.chart)
      this.chart = chart
      const option = {
        series: [{
          type: 'pie',
          radius: ['65%', '85%'],
          color: [this.gradientColor, 'rgba(45,75,122,0.3)'],
          label: { show: false },
          data: [
            { value: this.data.value },
            { value: 100 - this.data.value }
          ],
          emphasis: {
            scale: false
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.3)'
          }
        }]
      }
      chart.setOption(option)
      this.onResize = () => chart.resize()
      window.addEventListener('resize', this.onResize)
    },
    // 颜色提亮
    lightenColor(color, percent) {
      const num = parseInt(color.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) + amt
      const G = (num >> 8 & 0x00FF) + amt
      const B = (num & 0x0000FF) + amt
      return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      ).toString(16).slice(1)
    }
  }
}
</script>

<style scoped>
.shop-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 80%;
  z-index: 2;
}

.chart-title {
  color: #7db2ff;
  font-size: 16px;
  font-weight: 600;
  top: 50px;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-dot {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 15px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, var(--dot-color) 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(255, 255, 255, 0.3);
  position: relative;
  --dot-color: v-bind('data.color');
}

.inner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.amount {
  color: #0a1d3a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 2px 2px rgba(255, 255, 255, 0.3);
}

.unit {
  color: #2d4b7a;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
}

.count {
  color: #7db2ff;
  font-size: 14px;
  margin: 8px 0;
}

.category {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  margin-top: 10px;
}
</style>
