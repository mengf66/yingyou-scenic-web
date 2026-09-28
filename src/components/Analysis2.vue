<template>
  <div class="screen-grid">
    <!-- 左：舆情统计 -->
    <div class="col left">
      <ScreenPanel title="舆情统计概览" class="stats-panel">
        <div class="stats-container">
          <div v-for="(item, index) in publicOpinionStats" :key="index" class="stat-item">
            <div class="stat-title">{{ item.title }}</div>
            <div class="stat-value">{{ item.value }}</div>
            <div :class="['stat-compare', item.trend]">
              {{ item.trend === 'up' ? '▲' : '▼' }} {{ item.rate }}%
            </div>
          </div>
        </div>
      </ScreenPanel>
      <ScreenPanel title="情感倾向" sub="BERT 情感分析" class="r-sent">
        <BaseChart :option="sentimentOption" />
      </ScreenPanel>
    </div>

    <!-- 中：词云 + 趋势 -->
    <div class="col">
      <ScreenPanel title="舆情词云" sub="近 30 日高频话题" class="r-cloud">
        <BaseChart :option="wordCloudOption" />
      </ScreenPanel>
      <ScreenPanel title="舆情趋势" sub="近 14 日 · 正面 / 负面" class="r-trend">
        <BaseChart :option="trendOption" />
      </ScreenPanel>
    </div>

    <!-- 右：热门舆情 -->
    <div class="col">
      <ScreenPanel title="热门舆情信息" sub="实时抓取 · 按热度排序" class="r-comments">
        <div class="comments">
          <div v-for="(comment, index) in hotComments" :key="index" :class="['comment', toneOf(comment.content)]">
            <div class="c-head">
              <span class="c-rank">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="username">{{ comment.user }}</span>
              <span class="tone">{{ { pos: '好评', neg: '待改进', neu: '建议' }[toneOf(comment.content)] }}</span>
              <span class="time">{{ comment.time }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
      </ScreenPanel>
      <ScreenPanel title="热点话题榜" sub="提及量 · 环比" class="r-topics">
        <div class="topics">
          <div v-for="(t, i) in topics" :key="t.name" class="topic">
            <span :class="['t-rank', { top: i < 3 }]">{{ i + 1 }}</span>
            <span class="t-name">{{ t.name }}</span>
            <div class="t-bar"><i :style="{ width: (t.value / topics[0].value) * 100 + '%' }"></i></div>
            <span class="t-num">{{ t.value }}</span>
            <span :class="['t-trend', t.trend > 0 ? 'up' : 'down']">{{ t.trend > 0 ? '▲' : '▼' }}{{ Math.abs(t.trend) }}%</span>
          </div>
        </div>
      </ScreenPanel>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import 'echarts-wordcloud'
import BaseChart from './BaseChart.vue'
import ScreenPanel from './screen/ScreenPanel.vue'
import { C, PALETTE, axis, tooltip, legend } from './screen/theme'

export default {
  components: { BaseChart, ScreenPanel },
  setup() {
    // 舆情统计数据
    const publicOpinionStats = ref([
      { title: '今日舆情总数', value: '2,856', trend: 'up', rate: 12 },
      { title: '昨日舆情总数', value: '2,548', trend: 'down', rate: 5 },
      { title: '本周舆情总数', value: '18,942', trend: 'up', rate: 8 },
      { title: '上周舆情总数', value: '17,532', trend: 'down', rate: 3 },
      { title: '本月舆情总数', value: '62,358', trend: 'up', rate: 15 },
      { title: '上月舆情总数', value: '54,210', trend: 'up', rate: 2 }
    ])

    // 热门评论数据
    const hotComments = ref([
      {
        user: '游客_山水之间',
        time: '2小时前',
        content: '五台山的文化底蕴令人震撼，不过景区指示牌可以再完善些，第一次来容易迷路'
      },
      {
        user: '旅行者小王',
        time: '3小时前',
        content: '平遥古城的夜景太美了！建议增加更多传统文化体验项目，会再来！'
      },
      {
        user: '摄影爱好者老张',
        time: '5小时前',
        content: '云冈石窟的保护工作做得很好，但希望开放更多区域给摄影爱好者'
      },
      {
        user: '自驾游达人',
        time: '6小时前',
        content: '壶口瀑布气势磅礴，但周边停车场需要扩建，周末车位紧张'
      },
      {
        user: '文化爱好者',
        time: '8小时前',
        content: '悬空寺的古代建筑智慧让人惊叹，建议增加更多历史讲解服务'
      },
      {
        user: '家庭游客',
        time: '10小时前',
        content: '景区亲子设施很完善，工作人员服务热情，孩子玩得很开心'
      }
    ])

    // 词云数据
    const wordCloudData = ref([
      { name: '景区服务', value: 150 },
      { name: '文化体验', value: 135 },
      { name: '旅游设施', value: 128 },
      { name: '文物保护', value: 115 },
      { name: '游客体验', value: 108 },
      { name: '景区管理', value: 102 },
      { name: '自然风光', value: 98 },
      { name: '历史底蕴', value: 95 },
      { name: '导游服务', value: 88 },
      { name: '门票价格', value: 85 },
      { name: '环境卫生', value: 82 },
      { name: '交通便利', value: 78 },
      { name: '特色美食', value: 75 },
      { name: '安全措施', value: 72 },
      { name: '旅游纪念品', value: 68 },
      { name: '智慧旅游', value: 65 },
      { name: '节庆活动', value: 62 },
      { name: '夜间照明', value: 58 },
      { name: '无障碍设施', value: 55 },
      { name: '游客中心', value: 52 }
    ])

    // 原词云 sizeRange 为 [10, 10]，所有词一样大，看不出热度差异；这里按热度放大
    const wordCloudOption = computed(() => ({
      tooltip: tooltip(),
      series: [{
        type: 'wordCloud',
        shape: 'circle',
        width: '96%',
        height: '96%',
        left: 'center',
        top: 'center',
        sizeRange: [16, 68],
        rotationRange: [0, 0],
        gridSize: 12,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'JinTitle, STKaiti, KaiTi, serif',
          color: p => (p.dataIndex < 4 ? C.goldLight : PALETTE[p.dataIndex % PALETTE.length])
        },
        emphasis: { focus: 'self', textStyle: { textShadowBlur: 12, textShadowColor: C.gold } },
        data: [...wordCloudData.value].sort((a, b) => b.value - a.value)
      }]
    }))

    // 情感倾向（与景区端「接收反馈」同口径的示例数据）
    const sentimentOption = computed(() => ({
      tooltip: tooltip({ trigger: 'item', formatter: '{b}：{d}%' }),
      legend: legend({ bottom: 0, left: 'center' }),
      color: [C.jade, C.azure, C.cinnabar],
      series: [{
        type: 'pie',
        radius: ['48%', '70%'],
        center: ['50%', '44%'],
        label: { show: true, position: 'center', formatter: '正面\n{a|68%}', color: C.text2, fontSize: 12, rich: { a: { fontSize: 22, color: C.goldLight, fontWeight: 600, padding: [4, 0, 0, 0] } } },
        emphasis: { label: { show: true, formatter: '{b}\n{a|{d}%}' } },
        labelLine: { show: false },
        itemStyle: { borderColor: '#101d3f', borderWidth: 3 },
        data: [
          { name: '正面', value: 68 },
          { name: '中性', value: 21 },
          { name: '负面', value: 11 }
        ]
      }]
    }))

    const days = [...Array(14)].map((_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400000)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    const POS = [1820, 1960, 1750, 2100, 2380, 2610, 2290, 1980, 2050, 2240, 2460, 2720, 2530, 2380]
    const NEG = [210, 260, 190, 240, 330, 410, 300, 220, 250, 280, 310, 360, 290, 270]
    const trendOption = computed(() => ({
      tooltip: tooltip({ trigger: 'axis' }),
      legend: legend({ top: 0, right: 0, icon: 'circle' }),
      grid: { top: 28, bottom: 4, left: 4, right: 10, containLabel: true },
      xAxis: axis({ type: 'category', boundaryGap: false, data: days }),
      yAxis: axis({ type: 'value', axisLine: { show: false } }),
      series: [
        {
          name: '正面', type: 'line', smooth: true, showSymbol: false, data: POS,
          lineStyle: { color: C.gold, width: 2 }, itemStyle: { color: C.gold },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(217,179,106,0.35)' }, { offset: 1, color: 'rgba(217,179,106,0)' }] } }
        },
        {
          name: '负面', type: 'line', smooth: true, showSymbol: false, data: NEG,
          lineStyle: { color: C.cinnabar, width: 2 }, itemStyle: { color: C.cinnabar },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(217,96,76,0.3)' }, { offset: 1, color: 'rgba(217,96,76,0)' }] } }
        }
      ]
    }))

    // 简单判断评论语气，用于卡片着色：有转折/抱怨 → 待改进；纯夸赞 → 好评；其余为建议
    const toneOf = text => (/(但|不过|紧张|迷路|需要扩建)/.test(text) ? 'neg' : /(建议|希望)/.test(text) ? 'neu' : 'pos')

    // 热点话题：取词云前 6 个话题
    const TREND = [18, 12, -4, 9, 6, -2]
    const topics = computed(() => [...wordCloudData.value].sort((a, b) => b.value - a.value).slice(0, 6).map((t, i) => ({ ...t, trend: TREND[i] })))

    return {
      publicOpinionStats,
      hotComments,
      wordCloudOption,
      sentimentOption,
      trendOption,
      toneOf,
      topics
    }
  }
}
</script>

<style scoped>
.screen-grid {
  display: grid;
  grid-template-columns: 0.8fr 1.5fr 1.1fr;
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
.stats-panel { flex: 4; }
.r-sent { flex: 4; }
.r-cloud { flex: 6; }
.r-trend { flex: 4; }
.r-comments { flex: 6; }
.r-topics { flex: 4; }

.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 1fr;
  gap: 10px;
  height: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(217, 179, 106, 0.1), rgba(217, 179, 106, 0.02));
  border-left: 2px solid var(--jin);
}

.stat-title {
  color: var(--screen-text-2);
  font-size: 12px;
}

.stat-value {
  margin: 4px 0 2px;
  font-family: var(--font-num);
  font-size: 22px;
  font-weight: 600;
  color: var(--jin-light);
}

.stat-compare {
  font-size: 11px;
}

.stat-compare.up {
  color: #e07a64;
}

.stat-compare.down {
  color: #5fb3a1;
}

/* 热点话题 */
.topics {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
}
.topic {
  display: grid;
  grid-template-columns: 22px 76px 1fr 36px 44px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.t-rank {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  font-family: var(--font-num);
  font-size: 11px;
  color: var(--screen-text-2);
  border: 1px solid rgba(169, 180, 204, 0.4);
  border-radius: 2px;
}
.t-rank.top {
  color: #1a1206;
  background: var(--jin);
  border-color: var(--jin-light);
}
.t-name {
  color: var(--screen-text);
}
.t-bar {
  height: 5px;
  border-radius: 3px;
  background: rgba(217, 179, 106, 0.08);
  overflow: hidden;
}
.t-bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(217, 179, 106, 0.3), var(--jin-light));
}
.t-num {
  text-align: right;
  font-family: var(--font-num);
  color: var(--jin-light);
}
.t-trend {
  text-align: right;
  font-size: 11px;
}
.t-trend.up { color: #e07a64; }
.t-trend.down { color: #5fb3a1; }

/* 评论列表 */
.comments {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.comment {
  padding: 8px 12px;
  background: rgba(217, 179, 106, 0.04);
  border: 1px solid rgba(217, 179, 106, 0.12);
  border-left: 3px solid var(--tone);
}
.comment.pos { --tone: #5fb3a1; }
.comment.neg { --tone: #d9604c; }
.comment.neu { --tone: #6f9fd8; }

.c-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}

.c-rank {
  font-family: var(--font-num);
  font-weight: 700;
  color: var(--jin);
}

.username {
  color: var(--screen-text);
}

.tone {
  padding: 0 6px;
  font-size: 11px;
  line-height: 18px;
  color: var(--tone);
  border: 1px solid var(--tone);
  border-radius: 2px;
}

.time {
  margin-left: auto;
  color: var(--screen-text-2);
}

.comment-content {
  font-size: 13px;
  line-height: 1.7;
  color: #cfd6e4;
}
</style>
