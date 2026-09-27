<template>
  <div class="warn-page">
    <div class="top">
      <div class="card gauge">
        <div class="card-title">景区综合风险指数</div>
        <EChart :option="gaugeOption" height="220px" />
        <div class="gauge-tip">取各预警簇风险指数的加权平均（按反馈数量加权）</div>
      </div>
      <div class="card levels">
        <div class="card-title">预警等级分布</div>
        <div class="lv-grid">
          <div v-for="l in levelStats" :key="l.level" class="lv" :style="{ '--c': l.hex }">
            <div class="lv-n">{{ l.count }}</div>
            <div class="lv-name">{{ l.color }}预警</div>
            <div class="lv-sub">{{ l.level }} · {{ l.range }}</div>
          </div>
        </div>
        <EChart :option="scenicOption" height="130px" />
      </div>
      <div class="card model">
        <div class="card-title">风险指数模型</div>
        <p class="formula">R = 35·负面情绪强度 + 25·安全词命中 + 20·同类问题热度 + 20·问题类型权重</p>
        <ul>
          <li><b>负面情绪强度</b>：BERT 情感得分取负值部分（0~1）</li>
          <li><b>安全词命中</b>：危险、隐患、松动、坍塌、拥挤、踩踏等词出现次数</li>
          <li><b>同类问题热度</b>：同一景区、同一类型反馈数量的对数归一化</li>
          <li><b>类型权重</b>：安全事件 1.0 &gt; 古建损伤 0.85 &gt; 设施故障 0.8 &gt; 交通停车 0.5 …</li>
        </ul>
        <p class="note">线上版本由线性回归拟合权重、决策树划分等级阈值；R≥75 红色、≥55 橙色、≥35 黄色、其余蓝色。</p>
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="card-title">共性问题聚类预警（{{ clusters.length }} 簇）</div>
        <div class="spacer"></div>
        <el-checkbox v-model="onlyOpen">仅看未处置</el-checkbox>
        <el-select v-model="minLevel" style="width: 150px">
          <el-option label="全部等级" :value="0" />
          <el-option label="黄色及以上" :value="35" />
          <el-option label="橙色及以上" :value="55" />
          <el-option label="仅红色" :value="75" />
        </el-select>
      </div>
      <el-empty v-if="!shown.length" description="当前没有符合条件的预警" />
      <div class="clusters">
        <div v-for="c in shown" :key="c.key" class="cluster" :style="{ '--c': c.lv.hex }">
          <div class="c-head">
            <el-tag :color="c.lv.hex" effect="dark" class="c-lv">{{ c.lv.color }}预警 {{ c.lv.level }}</el-tag>
            <span class="c-title">{{ c.scenic }} · {{ c.type }}</span>
            <span class="c-risk">风险指数 <b>{{ c.risk }}</b></span>
          </div>
          <div class="c-meta">
            <span>涉及 {{ c.items.length }} 条反馈</span>
            <span>未处置 {{ c.open }} 条</span>
            <span>最近 {{ c.latest }}</span>
            <span>位置：{{ c.locations.join('、') }}</span>
          </div>
          <div class="c-kw">
            <span v-for="k in c.keywords" :key="k" class="kw">{{ k }}</span>
          </div>
          <div class="c-sample">“{{ c.top.content }}”</div>
          <div class="c-ops">
            <el-button v-if="c.topOpen" size="small" type="primary" @click="dispatch(c)">一键派单</el-button>
            <el-button size="small" @click="publishWarning(c)">发布预警公告</el-button>
            <el-button size="small" link type="primary" @click="router.push({ path: '/feedback' })">查看反馈</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import EChart from '@/components/common/EChart.vue'
import { listFeedbacks, saveNotice } from '@/api'
import { riskLevel } from '@/utils/nlp'

const router = useRouter()
const feedbacks = ref([])
const onlyOpen = ref(false)
const minLevel = ref(0)

onMounted(async () => {
  feedbacks.value = (await listFeedbacks()).filter(f => f.analysis.sentiment !== 'positive' && f.status !== '已忽略')
})

/** 按「景区 + 问题类型」聚类共性问题 */
const clusters = computed(() => {
  const map = {}
  feedbacks.value.forEach(f => {
    const key = f.scenic + '|' + f.type
    ;(map[key] = map[key] || { key, scenic: f.scenic, type: f.type, items: [] }).items.push(f)
  })
  return Object.values(map).map(c => {
    const items = c.items.sort((a, b) => b.analysis.risk - a.analysis.risk)
    const maxRisk = items[0].analysis.risk
    const avg = items.reduce((s, f) => s + f.analysis.risk, 0) / items.length
    const risk = Math.round(0.6 * maxRisk + 0.4 * avg)
    const kw = {}
    items.forEach(f => f.analysis.keywords.forEach(k => (kw[k] = (kw[k] || 0) + 1)))
    const openItems = items.filter(f => f.status === '待处理')
    return {
      ...c,
      items,
      risk,
      lv: riskLevel(risk),
      top: items[0],
      topOpen: openItems[0],
      open: openItems.length,
      latest: items.map(f => f.createdAt).sort().pop(),
      locations: [...new Set(items.map(f => f.location))].slice(0, 4),
      keywords: Object.entries(kw).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0])
    }
  }).sort((a, b) => b.risk - a.risk)
})

const shown = computed(() => clusters.value.filter(c => c.risk >= minLevel.value && (!onlyOpen.value || c.open > 0)))

const overall = computed(() => {
  const cs = clusters.value
  const n = cs.reduce((s, c) => s + c.items.length, 0)
  return n ? Math.round(cs.reduce((s, c) => s + c.risk * c.items.length, 0) / n) : 0
})

const gaugeOption = computed(() => ({
  series: [{
    type: 'gauge', min: 0, max: 100, radius: '92%', center: ['50%', '58%'],
    axisLine: { lineStyle: { width: 16, color: [[0.35, '#409eff'], [0.55, '#e6c229'], [0.75, '#ff9f43'], [1, '#f56c6c']] } },
    pointer: { width: 5, itemStyle: { color: 'auto' } },
    axisTick: { distance: -16, length: 6, lineStyle: { color: '#fff' } },
    splitLine: { distance: -16, length: 16, lineStyle: { color: '#fff', width: 2 } },
    axisLabel: { distance: 20, fontSize: 10, color: '#8a94a6' },
    detail: { valueAnimation: true, fontSize: 26, offsetCenter: [0, '62%'], color: 'inherit', formatter: v => `${v}\n{a|${riskLevel(v).color}}`, rich: { a: { fontSize: 13, color: '#8a94a6', padding: [6, 0, 0, 0] } } },
    data: [{ value: overall.value }]
  }]
}))

const LEVELS = [
  { min: 75, range: '≥75' },
  { min: 55, range: '55-74' },
  { min: 35, range: '35-54' },
  { min: 0, range: '<35' }
]
const levelStats = computed(() => LEVELS.map((l, i) => {
  const max = i === 0 ? 101 : LEVELS[i - 1].min
  return { ...riskLevel(l.min), range: l.range, count: clusters.value.filter(c => c.risk >= l.min && c.risk < max).length }
}))

const scenicOption = computed(() => {
  const m = {}
  clusters.value.forEach(c => (m[c.scenic] = Math.max(m[c.scenic] || 0, c.risk)))
  const arr = Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6)
  return {
    grid: { left: 70, right: 30, top: 6, bottom: 6 },
    tooltip: {},
    xAxis: { type: 'value', max: 100, show: false },
    yAxis: { type: 'category', inverse: true, data: arr.map(a => a[0]), axisLine: { show: false }, axisTick: { show: false } },
    series: [{ type: 'bar', barWidth: 8, data: arr.map(a => ({ value: a[1], itemStyle: { color: riskLevel(a[1]).hex, borderRadius: 4 } })), label: { show: true, position: 'right', fontSize: 10 } }]
  }
})

function dispatch(c) {
  router.push({ path: '/workorder/create', query: { feedbackId: c.topOpen.id } })
}

async function publishWarning(c) {
  await ElMessageBox.confirm(`将向游客端及「${c.scenic}」周边商户推送安全预警公告，是否继续？`, '发布预警公告', { type: 'warning' })
  await saveNotice({
    title: `${c.scenic}${c.locations[0] || ''}安全提示`,
    type: '安全预警',
    content: `${c.locations.join('、')}区域近期收到${c.items.length}条关于「${c.type}」的反馈，景区已安排人员处置。请游客注意安全、服从现场工作人员引导，周边商户请及时做好营业调整。`,
    scenic: [c.scenic],
    channels: { tourist: ['banner', 'message'], social: ['wechat'] },
    theme: 'blue',
    status: 'published'
  })
  ElMessage.success('预警公告已发布')
}
</script>

<style scoped>
.top {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.3fr;
  gap: 14px;
  margin-bottom: 14px;
}
.card {
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(15, 35, 80, 0.06);
}
.card-title {
  font-weight: 600;
  color: #1f2d3d;
  padding-left: 8px;
  border-left: 3px solid #3b7ad9;
  line-height: 1;
  margin-bottom: 8px;
}
.gauge-tip {
  text-align: center;
  font-size: 12px;
  color: #a0a8b8;
}
.lv-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 10px 0;
}
.lv {
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  background: color-mix(in srgb, var(--c) 12%, white);
  border: 1px solid color-mix(in srgb, var(--c) 40%, white);
}
.lv-n {
  font-size: 24px;
  font-weight: 700;
  color: var(--c);
}
.lv-name {
  font-size: 13px;
  color: #1f2d3d;
}
.lv-sub {
  font-size: 11px;
  color: #8a94a6;
}
.model {
  font-size: 13px;
  color: #5a6477;
}
.formula {
  background: #f4f7fd;
  border-radius: 6px;
  padding: 10px;
  color: #2a5bac;
  font-weight: 600;
  margin: 10px 0;
}
.model ul {
  padding-left: 18px;
  margin: 0;
  line-height: 1.9;
}
.note {
  color: #a0a8b8;
  font-size: 12px;
  margin: 8px 0 0;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.toolbar .card-title {
  margin: 0;
}
.spacer {
  flex: 1;
}
.clusters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.cluster {
  border: 1px solid #e8edf5;
  border-left: 4px solid var(--c);
  border-radius: 6px;
  padding: 12px 14px;
}
.c-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.c-lv {
  border: none;
}
.c-title {
  font-weight: 600;
  color: #1f2d3d;
}
.c-risk {
  margin-left: auto;
  font-size: 13px;
  color: #8a94a6;
}
.c-risk b {
  font-size: 20px;
  color: var(--c);
}
.c-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: #8a94a6;
  margin: 8px 0 6px;
}
.kw {
  display: inline-block;
  padding: 0 6px;
  margin: 2px 4px 2px 0;
  font-size: 12px;
  border-radius: 3px;
  background: #eef4ff;
  color: #3b7ad9;
}
.c-sample {
  font-size: 13px;
  color: #5a6477;
  margin: 6px 0 10px;
  line-height: 1.6;
}
</style>
