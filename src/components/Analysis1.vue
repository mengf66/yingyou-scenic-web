<template>
  <div class="screen-grid">
    <!-- 左列 -->
    <div class="col">
      <ScreenPanel title="景点热度排行" sub="近 30 日综合指数" class="r-3">
        <HorizontalBar :data="hotRankData" />
      </ScreenPanel>
      <ScreenPanel title="消费业态占比" class="r-3">
        <RingPie :data="consumptionData" />
      </ScreenPanel>
      <ScreenPanel title="游客年龄分布" class="r-3">
        <GroupedBar :data="ageData" />
      </ScreenPanel>
      <ScreenPanel title="来源城市排行" class="r-3">
        <HorizontalBar :data="cityRankData" />
      </ScreenPanel>
    </div>

    <!-- 中列 -->
    <div class="col">
      <div class="kpi-row">
        <div v-for="s in visitorStats" :key="s.title" class="kpi">
          <div class="kpi-label">{{ s.title }}</div>
          <div class="kpi-value">{{ s.value }}</div>
          <div v-if="s.trend" :class="['kpi-trend', s.trend]">{{ s.trend === 'up' ? '▲' : '▼' }} {{ s.rate }}%</div>
          <div v-else class="kpi-trend live"><i></i>实时</div>
        </div>
      </div>
      <ScreenPanel title="山西文旅热力图" sub="地市客流热度 · 古城游线" class="map-panel">
        <template #extra><TimeWeather /></template>
        <ShanxiMap :data="heatData.coordinates" />
      </ScreenPanel>
      <ScreenPanel title="年度客流量统计" sub="今年 vs 去年" class="r-bottom">
        <CompareBar :data="annualData" />
      </ScreenPanel>
    </div>

    <!-- 右列 -->
    <div class="col">
      <ScreenPanel title="年度游客对比" sub="单位：万人次" class="r-3">
        <MultiLine :data="annualCompare" />
      </ScreenPanel>
      <ScreenPanel title="游客满意度" class="r-4">
        <SatisfactionPie :data="satisfactionData" />
      </ScreenPanel>
      <ScreenPanel title="热门景区实时客流" sub="在园人数 / 最大承载量" class="r-3">
        <div class="flow-list">
          <div v-for="f in liveFlow" :key="f.name" class="flow">
            <span class="flow-name">{{ f.name }}</span>
            <div class="flow-bar"><i :class="level(f.rate)" :style="{ width: f.rate + '%' }"></i></div>
            <span class="flow-num">{{ f.now.toLocaleString() }}</span>
            <span :class="['flow-tag', level(f.rate)]">{{ { hot: '拥挤', warm: '较多', ok: '舒适' }[level(f.rate)] }}</span>
          </div>
        </div>
      </ScreenPanel>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import HorizontalBar from './HorizontalBar.vue'
import GroupedBar from './GroupedBar.vue'
import CompareBar from './CompareBar.vue'
import MultiLine from './MultiLine.vue'
import TimeWeather from './TimeWeather.vue'
import RingPie from './RingPie.vue'
import SatisfactionPie from './SatisfactionPie.vue'
import ScreenPanel from './screen/ScreenPanel.vue'
import ShanxiMap from './screen/ShanxiMap.vue'

export default {
  components: {
    HorizontalBar,
    GroupedBar,
    CompareBar,
    MultiLine,
    TimeWeather,
    RingPie,
    SatisfactionPie,
    ScreenPanel,
    ShanxiMap
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

    // 游客热力分布（名称需与 assets/shanxi.json 中的地市名称一致）
    const heatData = ref({
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
      { title: '当前在园', value: '3,245', trend: null },
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
      { name: '卫生满意度', value: 87 }
    ])

    // 热门景区实时客流（rate = 当前在园 / 最大承载量，%）
    const liveFlow = ref([
      { name: '平遥古城', now: 18650, rate: 88 },
      { name: '五台山', now: 15320, rate: 76 },
      { name: '云冈石窟', now: 9870, rate: 71 },
      { name: '壶口瀑布', now: 7640, rate: 62 },
      { name: '晋祠', now: 5210, rate: 48 },
      { name: '乔家大院', now: 4380, rate: 42 }
    ])

    const level = rate => (rate > 85 ? 'hot' : rate > 65 ? 'warm' : 'ok')

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
      liveFlow,
      level
    }
  }
}
</script>

<style scoped>
.screen-grid {
  display: grid;
  grid-template-columns: 1fr 1.55fr 1fr;
  gap: 14px;
  height: 100%;
  min-height: 0;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  min-width: 0;
}
.r-3 { flex: 3; }
.r-4 { flex: 4; }
.map-panel { flex: 7; }
.r-bottom { flex: 3.2; }

/* ---------- 核心指标 ---------- */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  flex-shrink: 0;
}
.kpi {
  position: relative;
  padding: 10px 8px 8px;
  text-align: center;
  background: linear-gradient(180deg, rgba(217, 179, 106, 0.12), rgba(217, 179, 106, 0.02));
  border: 1px solid rgba(217, 179, 106, 0.28);
  border-radius: 2px;
}
.kpi::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -1px;
  width: 40%;
  height: 2px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, var(--jin-light), transparent);
}
.kpi-label {
  font-size: 12px;
  color: var(--screen-text-2);
  letter-spacing: 1px;
}
.kpi-value {
  margin: 4px 0 2px;
  font-family: var(--font-num);
  font-size: 24px;
  font-weight: 600;
  color: var(--jin-light);
  text-shadow: 0 0 12px rgba(217, 179, 106, 0.45);
}
.kpi-trend {
  font-size: 11px;
}
.kpi-trend.up { color: #e07a64; }
.kpi-trend.down { color: #5fb3a1; }
.kpi-trend.live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--screen-text-2);
}
.kpi-trend.live i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5fb3a1;
  animation: blink 1.4s infinite;
}
@keyframes blink {
  50% { opacity: 0.2; }
}

/* ---------- 实时客流 ---------- */
.flow-list {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
}
.flow {
  display: grid;
  grid-template-columns: 64px 1fr 52px 38px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.flow-name {
  color: var(--screen-text);
}
.flow-bar {
  height: 6px;
  border-radius: 3px;
  background: rgba(217, 179, 106, 0.08);
  overflow: hidden;
}
.flow-bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
}
.flow-bar i.ok { background: linear-gradient(90deg, rgba(95, 179, 161, 0.3), #5fb3a1); }
.flow-bar i.warm { background: linear-gradient(90deg, rgba(217, 179, 106, 0.3), #e8cf94); }
.flow-bar i.hot { background: linear-gradient(90deg, rgba(217, 96, 76, 0.3), #d9604c); }
.flow-num {
  text-align: right;
  font-family: var(--font-num);
  color: var(--jin-light);
}
.flow-tag {
  text-align: center;
  font-size: 11px;
  border-radius: 2px;
  padding: 1px 0;
}
.flow-tag.ok { color: #5fb3a1; border: 1px solid rgba(95, 179, 161, 0.5); }
.flow-tag.warm { color: #e8cf94; border: 1px solid rgba(232, 207, 148, 0.5); }
.flow-tag.hot { color: #e07a64; border: 1px solid rgba(224, 122, 100, 0.6); }

/* ---------- 手机：单列纵向排布 ---------- */
@media (max-width: 900px) {
  .screen-grid {
    display: flex;
    flex-direction: column;
    height: auto;
    gap: 12px;
  }
  .col {
    gap: 12px;
  }
  .col > .panel {
    flex: none;
    height: 260px;
  }
  .col > .map-panel {
    height: 440px;
  }
  .col > .r-4 {
    height: 330px;
  }
  .map-panel :deep(.panel-head) {
    flex-wrap: wrap;
    row-gap: 4px;
  }
  .map-panel :deep(.extra) {
    margin-left: 0;
    width: 100%;
  }
  .kpi-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .kpi-value {
    font-size: 19px;
  }
  .flow {
    grid-template-columns: 60px 1fr 48px 36px;
    gap: 6px;
  }
}
</style>
