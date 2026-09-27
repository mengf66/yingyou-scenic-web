<template>
  <div class="main-container">
    <!-- 景点热度排行 -->
    <div class="container container1">
      <div class="title-box2">
        <h3>景点热度排行</h3>
      </div>
      <HorizontalBar
          :data="hotRankData"
          class="chart-content chart-content2"
          :style="{ height: container1Height }"
      />
    </div>

    <div class="container container2">
      <!-- 消费业态占比 -->
      <div class="sub-container" style="top: 10px; height: 30%;">
        <div class="title-box2">
          <h3>消费业态占比</h3>
        </div>
        <RingPie :data="consumptionData" class="chart-content" />
      </div>

      <!-- 游客年龄分布 -->
      <div class="sub-container" style="top: 32%; height: 44%;">
        <div class="title-box2">
          <h3>游客年龄分布</h3>
        </div>
        <GroupedBar :data="ageData" class="chart-content" />
      </div>

      <!-- 来源城市排行 -->
      <div class="sub-container" style="top: 72%; height: 30%;">
        <div class="title-box2">
          <h3>来源城市排行</h3>
        </div>
        <HorizontalBar
            :data="cityRankData"
            class="chart-content"
            :style="{ height: cityChartHeight }"
        />
      </div>
    </div>

    <!-- 时间天气 + 山西省地图 -->
    <div class="container container3">
      <TimeWeather class="time-weather" />
      <div class="title-box map-title">
        <h3>山西省地图</h3>
        <tmap-map
            :mapKey="tmapKey"
            :events="events"
            :center="center"
            :zoom="zoom"
            :doubleClickZoom="doubleClickZoom"
            :control="control"
        />
      </div>
    </div>

    <!-- 游客热力分布 -->
    <div class="container container4">
      <div class="title-box">
        <h3>游客热力分布</h3>
      </div>
      <HeatMap :data="heatData" class="heat-content" />
    </div>

    <!-- 年度客流量统计 -->
    <div class="container container5">
      <div class="title-box">
        <h3>年度客流量统计</h3>
      </div>
      <CompareBar :data="annualData" class="chart-content5" />
    </div>

    <!-- 游客数量统计 -->
    <div class="container container6">
      <div class="title-box2">
        <h3>游客数量统计</h3>
      </div>
      <VisitorStats :stats="visitorStats" class="stats-content" />
    </div>

    <!-- 年度游客对比 -->
    <div class="container container7">
      <div class="title-box2">
        <h3>年度游客对比</h3>
      </div>
      <MultiLine :data="annualCompare" class="chart-content5" />
    </div>

    <!-- 游客满意度 -->
    <div class="container container8">
      <div class="title-box2">
        <h3>游客满意度</h3>
      </div>
      <SatisfactionPie
          :data="satisfactionData"
          class="satisfaction-content"
          :style="{ height: satisfactionHeight }"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import HorizontalBar from './HorizontalBar.vue'
import GroupedBar from './GroupedBar.vue'
import CompareBar from './CompareBar.vue'
import MultiLine from './MultiLine.vue'
import TimeWeather from './TimeWeather.vue'
import MapChart from './MapChart.vue'
import VisitorStats from './VisitorStats.vue'
import HeatMap from './HeatMap.vue'
import RingPie from './RingPie.vue'
import SatisfactionPie from './SatisfactionPie.vue'

export default {
  components: {
    HorizontalBar,
    GroupedBar,
    CompareBar,
    MultiLine,
    TimeWeather,
    MapChart,
    VisitorStats,
    HeatMap,
    RingPie,
    SatisfactionPie
  },
  setup() {
    // 景点热度排行
    const hotRankData = ref({
      categories: ['五台山', '平遥古城', '云冈石窟', '壶口瀑布', '悬空寺'],
      values: [8560, 7420, 6980, 6350, 5820]
    })

    // 消费业态占比
    const consumptionData = ref({
      data: [
        { value: 35, name: '酒店' },
        { value: 25, name: '门票' },
        { value: 20, name: '餐饮' },
        { value: 20, name: '文创' }
      ]
    })

    // 来源城市排行
    const cityRankData = ref({
      categories: ['北京', '上海', '广州', '西安', '郑州'],
      values: [6850, 6420, 5980, 5720, 5340]
    })

    // 游客年龄分布
    const ageData = ref({
      categories: ['0-10', '10-20', '20-30', '30-40', '40-50', '60+'],
      male: [120, 350, 820, 650, 430, 280],
      female: [110, 320, 850, 620, 410, 310]
    })

    // 游客热力分布
    const heatData = ref({
      // 名称需与 assets/shanxi.json 中的地市名称一致（带"市"）
      coordinates: [
        { name: '太原市', value: 95 },
        { name: '大同市', value: 80 },
        { name: '晋中市', value: 88 },
        { name: '临汾市', value: 68 },
        { name: '运城市', value: 72 },
        { name: '忻州市', value: 76 },
        { name: '吕梁市', value: 52 },
        { name: '长治市', value: 58 },
        { name: '晋城市', value: 61 },
        { name: '阳泉市', value: 45 },
        { name: '朔州市', value: 40 }
      ]
    })

    // 年度客流量统计
    const annualData = ref({
      lastYear: [12000, 13500, 14200, 15600, 16300, 17800, 18500, 19200, 17600, 16500, 14800, 13000],
      currentYear: [14000, 15200, 16800, 18200, 19500, 21000, 22500, 21800, 20500, 19200, 17500, 15800]
    })

    // 年度游客对比
    const annualCompare = ref({
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      y2022: [85, 73, 92, 88, 95, 101, 115, 123, 110, 98, 86, 79],
      y2023: [92, 85, 105, 98, 112, 125, 138, 145, 132, 118, 105, 96],
      y2024: [105, 98, 120, 115, 128, 142, 155, 162, 148, 135, 122, 110]
    })

    // 游客数量统计
    const visitorStats = ref([
      { title: '今日游客', value: '24,532', trend: 'up', rate: 12 },
      { title: '昨日游客', value: '21,890', trend: 'down', rate: 5 },
      { title: '当前游客', value: '3,245', trend: null },
      { title: '本周游客', value: '158,200', trend: 'up', rate: 8 },
      { title: '本月游客', value: '582,300', trend: 'up', rate: 15 }
    ])

    // 游客满意度
    const satisfactionData = ref([
      { name: '安全满意度', value: 88 },
      { name: '景点满意度', value: 92 },
      { name: '设施满意度', value: 85 },
      { name: '服务满意度', value: 90 },
      { name: '价格满意度', value: 82 },
      { name: '清洁和维护满意度', value: 87 }
    ])

    // 腾讯地图
    const center = ref({ lat: 37.2037904, lng: 112.1771043 })
    const zoom = ref(15)
    const doubleClickZoom = ref(true)

    const container1Height = computed(() => window.innerHeight * 0.05 - 80 + 'px')
    const cityChartHeight = computed(() => window.innerHeight * 0.2 - 30 + 'px')
    const satisfactionHeight = computed(() => window.innerHeight * 0.4 - 50 + 'px')

    // 原代码在 resize 监听里再次派发 resize 事件，会无限递归导致页面卡死。
    // 各图表组件（BaseChart）已自行监听窗口尺寸变化，这里只需在挂载后触发一次重排。
    onMounted(() => {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
    })

    return {
      hotRankData,
      consumptionData,
      cityRankData,
      ageData,
      heatData,
      annualData,
      annualCompare,
      visitorStats,
      satisfactionData,
      container1Height,
      cityChartHeight,
      satisfactionHeight,
      // 原代码把双击事件绑定到了 window.print，双击地图会弹出打印对话框，已移除
      events: {},
      // 腾讯地图 Key，在 .env.local 的 VITE_TMAP_KEY 中配置
      tmapKey: import.meta.env.VITE_TMAP_KEY || '',
      center,
      zoom,
      doubleClickZoom,
      control: {
        scale: {},
        zoom: {
          position: 'bottomRight'
        }
      }
    }
  }
}
</script>

<style scoped>
.main-container {
  position: relative;
  height: calc(90vh - 80px);
  background: url('../assets/background.png');
  padding: 20px;
}

.container {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
  box-sizing: border-box;
}

.container1 {
  top: 5px;
  left: 20px;
  width: 27%;
  height: 15vh;
  min-height: 180px;
}

.container2 {
  top: calc(16vh + 40px);
  left: 20px;
  width: 27%;
  height: 67vh;
  min-height: 400px;
}

.container3 {
  top: 10px;
  left: calc(27% + 40px);
  width: 38%;
  height: 45vh;
}

.container4 {
  top: calc(45vh + 40px);
  left: calc(27% + 40px);
  width: 17%;
  height: 38vh;
  min-height: 200px;
}

.container5 {
  top: calc(45vh + 40px);
  left: calc(44% + 60px);
  width: 20%;
  height: 38vh;
  min-height: 200px;
}

.container6,
.container7,
.container8 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container6 {
  top: 10px;
  right: 20px;
  width: 30%;
  height: 25vh;
  min-height: 150px;
}

.container7 {
  top: calc(25vh + 20px);
  right: 20px;
  width: 30%;
  height: 25vh;
  min-height: 200px;
}

.container8 {
  top: calc(50vh + 30px);
  right: 20px;
  width: 30%;
  height: 34vh;
  min-height: 280px;
}

.heat-content {
  width: 100%;
  height: calc(100% - 50px) !important;
}

.chart-content {
  width: 100%;
  top: 20px;
  height: calc(90% - 40px) !important;
}

.chart-content2 {
  height: 110% !important;
}

.chart-content5 {
  width: 100%;
  height: 45vh !important;
}

.sub-container {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.satisfaction-content {
  height: 100%;
  width: 90%;
}

.map-content {
  height: calc(100% - 80px) !important;
}

.title-box,
.title-box2 {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.title-box h3,
.title-box2 h3 {
  color: #a8d1ff;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
}

.title-box2 {
  width: 5%;
  height: auto;
  padding: 15px 8px;
}

.title-box2 h3 {
  writing-mode: vertical-lr;
}

.container1 .title-box {
  text-align: center;
  width: max-content;
  margin: 0 auto 15px;
  background: linear-gradient(90deg, rgba(42, 91, 172, 0.6), rgba(25, 55, 109, 0.8));
  border: 1px solid rgba(42, 91, 172, 0.5);
}

.container2 .sub-container .title-box {
  text-align: center;
  top: 15px;
  width: max-content;
  margin: 0 auto 15px;
  background: linear-gradient(90deg, rgba(42, 91, 172, 0.6), rgba(25, 55, 109, 0.8));
  border: 1px solid rgba(42, 91, 172, 0.5);
}

.map-title {
  height: 30vh;
}

.container1,
.container2 .sub-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container6 .title-box2,
.container7 .title-box2,
.container8 .title-box2 {
  text-align: center;
  width: 5%;
  margin: 0 auto 15px;
  background: linear-gradient(90deg, rgba(42, 91, 172, 0.6), rgba(25, 55, 109, 0.8));
  position: relative;
}

.container6 .title-box2::after,
.container7 .title-box2::after,
.container8 .title-box2::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2a5bac, transparent);
}
</style>
