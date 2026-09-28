<template>
  <div class="fb-page">
    <!-- 概览 -->
    <div class="stats">
      <div v-for="s in summary" :key="s.label" class="stat" :style="{ '--c': s.color }">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ s.value }}<small>{{ s.unit }}</small></div>
        <div class="stat-sub">{{ s.sub }}</div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="charts">
      <div class="card">
        <div class="card-title">三方反馈来源</div>
        <EChart :option="sourceOption" height="230px" />
      </div>
      <div class="card">
        <div class="card-title">情感分析（BERT）</div>
        <EChart :option="sentimentOption" height="230px" />
      </div>
      <div class="card">
        <div class="card-title">反馈关键词</div>
        <EChart :option="wordOption" height="230px" />
      </div>
      <div class="card">
        <div class="card-title">问题 Top5</div>
        <EChart :option="topOption" height="230px" />
      </div>
    </div>
    <div class="card trend">
      <div class="card-title">近 14 天满意度与反馈量趋势</div>
      <EChart :option="trendOption" height="220px" />
    </div>

    <!-- 列表 -->
    <div class="card">
      <div class="toolbar">
        <el-select v-model="query.source" placeholder="反馈来源" clearable style="width: 120px" @change="load">
          <el-option v-for="s in SOURCES" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select v-model="query.type" placeholder="问题类型" clearable style="width: 130px" @change="load">
          <el-option v-for="t in FEEDBACK_TYPES" :key="t" :label="t" :value="t" />
        </el-select>
        <el-select v-model="query.sentiment" placeholder="情感倾向" clearable style="width: 120px" @change="load">
          <el-option label="正面" value="positive" />
          <el-option label="中性" value="neutral" />
          <el-option label="负面" value="negative" />
        </el-select>
        <el-select v-model="query.status" placeholder="处理状态" clearable style="width: 120px" @change="load">
          <el-option v-for="s in STATUS" :key="s" :label="s" :value="s" />
        </el-select>
        <el-input v-model="query.keyword" placeholder="搜索内容 / 位置" :prefix-icon="Search" clearable style="width: 200px" @change="load" />
        <div class="spacer"></div>
        <el-button :icon="Download" @click="exportCsv">导出</el-button>
        <el-button type="primary" :icon="Plus" @click="openMock">模拟接收反馈</el-button>
      </div>

      <el-table v-loading="loading" :data="pageList" stripe style="width: 100%" @row-click="showDetail">
        <el-table-column prop="createdAt" label="时间" width="140" />
        <el-table-column label="来源" width="90">
          <template #default="{ row }"><el-tag :type="sourceTag(row.source)" size="small">{{ row.source }}</el-tag></template>
        </el-table-column>
        <el-table-column label="景区 / 位置" width="170">
          <template #default="{ row }">{{ row.scenic }}<div class="sub">{{ row.location }}</div></template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column prop="content" label="反馈内容" min-width="240" show-overflow-tooltip />
        <el-table-column label="情感" width="100">
          <template #default="{ row }">
            <el-tag :type="SENT[row.analysis.sentiment].tag" size="small" effect="light">{{ SENT[row.analysis.sentiment].name }} {{ row.analysis.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关键词" width="150">
          <template #default="{ row }">
            <span v-for="k in row.analysis.keywords.slice(0, 3)" :key="k" class="kw">{{ k }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险指数" width="130" sortable :sort-method="(a, b) => a.analysis.risk - b.analysis.risk">
          <template #default="{ row }">
            <el-progress :percentage="row.analysis.risk" :color="riskLevel(row.analysis.risk).hex" :stroke-width="8" :format="p => p" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }"><el-tag :type="statusTag(row.status)" size="small" effect="plain">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === '待处理'" link type="primary" @click.stop="dispatch(row)">派单</el-button>
            <el-button v-if="row.workorderId" link type="primary" @click.stop="router.push({ path: '/workorder/track', query: { id: row.workorderId } })">查看工单</el-button>
            <el-button v-if="row.status === '待处理'" link type="info" @click.stop="ignore(row)">忽略</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" :page-size="PAGE_SIZE" layout="total, prev, pager, next" :total="list.length" class="pager" />
    </div>

    <!-- 详情 -->
    <el-drawer v-model="detail.visible" title="反馈详情" size="460px">
      <template v-if="detail.row">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="编号">{{ detail.row.id }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ detail.row.source }} · {{ detail.row.name }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ detail.row.scenic }} · {{ detail.row.location }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ detail.row.type }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ detail.row.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ detail.row.content }}</el-descriptions-item>
        </el-descriptions>
        <h4 class="h4">智能分析结果</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="情感倾向">
            <el-tag :type="SENT[detail.row.analysis.sentiment].tag">{{ SENT[detail.row.analysis.sentiment].name }}</el-tag>
            <span class="muted">情感得分 {{ detail.row.analysis.score }}（-1 ~ 1）</span>
          </el-descriptions-item>
          <el-descriptions-item label="关键词">
            <span v-for="k in detail.row.analysis.keywords" :key="k" class="kw">{{ k }}</span>
            <span v-if="!detail.row.analysis.keywords.length" class="muted">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="风险指数">
            <b :style="{ color: riskLevel(detail.row.analysis.risk).hex }">{{ detail.row.analysis.risk }}</b>
            <el-tag size="small" :color="riskLevel(detail.row.analysis.risk).hex" effect="dark" class="lv">{{ riskLevel(detail.row.analysis.risk).color }}预警 · {{ riskLevel(detail.row.analysis.risk).level }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="drawer-ops">
          <el-button v-if="detail.row.status === '待处理'" type="primary" @click="dispatch(detail.row)">生成工单并派单</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 模拟接收 -->
    <el-dialog v-model="mock.visible" title="模拟接收一条反馈" width="560px">
      <el-form :model="mock.form" label-width="80px">
        <el-form-item label="来源">
          <el-radio-group v-model="mock.form.source">
            <el-radio-button v-for="s in SOURCES" :key="s" :value="s">{{ s }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="反馈人"><el-input v-model="mock.form.name" /></el-form-item>
        <el-form-item label="景区">
          <el-select v-model="mock.form.scenic" style="width: 100%">
            <el-option v-for="s in SCENICS" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置"><el-input v-model="mock.form.location" placeholder="如：南门瓮城" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="mock.form.type" style="width: 100%">
            <el-option v-for="t in FEEDBACK_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="mock.form.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="实时分析">
          <div class="live">
            <el-tag :type="SENT[live.sentiment].tag" size="small">{{ SENT[live.sentiment].name }} {{ live.score }}</el-tag>
            <span v-for="k in live.keywords" :key="k" class="kw">{{ k }}</span>
            <span>风险 <b :style="{ color: riskLevel(live.risk).hex }">{{ live.risk }}</b></span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mock.visible = false">取消</el-button>
        <el-button type="primary" :disabled="!mock.form.content || !mock.form.location" @click="submitMock">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, Download } from '@element-plus/icons-vue'
import EChart from '@/components/common/EChart.vue'
import { listFeedbacks, createFeedback, updateFeedbackStatus } from '@/api'
import { SCENICS, FEEDBACK_TYPES, fmt } from '@/api/mockDb'
import { analyzeFeedback, riskLevel } from '@/utils/nlp'

const router = useRouter()
const SOURCES = ['游客', '商户', '工作人员']
const STATUS = ['待处理', '已派单', '已完成', '已忽略']
const SENT = { positive: { name: '正面', tag: 'success' }, neutral: { name: '中性', tag: 'info' }, negative: { name: '负面', tag: 'danger' } }
const PAGE_SIZE = 10

const query = reactive({ source: '', type: '', sentiment: '', status: '', keyword: '' })
const all = ref([])
const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageList = computed(() => list.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

async function load() {
  loading.value = true
  ;[all.value, list.value] = await Promise.all([listFeedbacks(), listFeedbacks(query)])
  page.value = 1
  loading.value = false
}
onMounted(load)

/* ---------- 概览 ---------- */
const satisfactionOf = arr => (arr.length ? Math.round(arr.reduce((s, f) => s + 50 + 50 * f.analysis.score, 0) / arr.length) : 0)
const today = fmt(Date.now()).slice(0, 10)
const summary = computed(() => {
  const a = all.value
  const neg = a.filter(f => f.analysis.sentiment === 'negative').length
  return [
    { label: '反馈总数', value: a.length, unit: '条', sub: `游客 ${a.filter(f => f.source === '游客').length} · 商户 ${a.filter(f => f.source === '商户').length} · 员工 ${a.filter(f => f.source === '工作人员').length}`, color: '#b83a2f' },
    { label: '待处理', value: a.filter(f => f.status === '待处理').length, unit: '条', sub: '需确认并派单', color: '#c9892f' },
    { label: '今日新增', value: a.filter(f => f.createdAt.startsWith(today)).length, unit: '条', sub: '实时接收三端反馈', color: '#3f7a5f' },
    { label: '满意度指数', value: satisfactionOf(a), unit: '分', sub: '基于情感得分折算（0-100）', color: '#6b5b95' },
    { label: '负面舆情占比', value: a.length ? ((neg / a.length) * 100).toFixed(1) : 0, unit: '%', sub: `负面 ${neg} 条`, color: '#c2413a' }
  ]
})

/* ---------- 图表 ---------- */
const sourceOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
  color: ['#b83a2f', '#3f7a5f', '#c9892f'],
  series: [{ type: 'pie', radius: ['36%', '58%'], center: ['50%', '44%'], label: { formatter: '{b}\n{d}%', overflow: 'none' }, data: SOURCES.map(s => ({ name: s, value: all.value.filter(f => f.source === s).length })) }]
}))

const sentimentOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
  color: ['#3f7a5f', '#a39a8f', '#c2413a'],
  series: [{ type: 'pie', roseType: 'radius', radius: ['18%', '58%'], center: ['50%', '44%'], label: { formatter: '{b} {c}', overflow: 'none' }, data: ['positive', 'neutral', 'negative'].map(k => ({ name: SENT[k].name, value: all.value.filter(f => f.analysis.sentiment === k).length })) }]
}))

const wordOption = computed(() => {
  const cnt = {}
  all.value.forEach(f => f.analysis.keywords.forEach(k => (cnt[k] = (cnt[k] || 0) + 1)))
  return {
    tooltip: {},
    series: [{
      type: 'wordCloud', sizeRange: [13, 38], rotationRange: [0, 0], gridSize: 6, width: '100%', height: '100%',
      textStyle: { fontFamily: 'JinTitle, STKaiti, KaiTi, serif', color: p => ['#b83a2f', '#2b3a4a', '#a88340', '#3f7a5f', '#6b5b95', '#3d7f8c'][p.dataIndex % 6] },
      data: Object.entries(cnt).map(([name, value]) => ({ name, value }))
    }]
  }
})

const topOption = computed(() => {
  const cnt = {}
  all.value.filter(f => f.analysis.sentiment !== 'positive').forEach(f => (cnt[f.type] = (cnt[f.type] || 0) + 1))
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 5).reverse()
  return {
    grid: { left: 70, right: 30, top: 10, bottom: 20 },
    tooltip: {},
    xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { type: 'dashed' } } },
    yAxis: { type: 'category', data: top.map(t => t[0]) },
    series: [{ type: 'bar', barWidth: 14, data: top.map(t => t[1]), label: { show: true, position: 'right' }, itemStyle: { borderRadius: [0, 7, 7, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#e6d3b0' }, { offset: 1, color: '#a88340' }] } } }]
  }
})

const trendOption = computed(() => {
  const days = [...Array(14)].map((_, i) => {
    return fmt(Date.now() - (13 - i) * 86400000).slice(0, 10)
  })
  const byDay = days.map(d => all.value.filter(f => f.createdAt.startsWith(d)))
  let last = 80
  const sat = byDay.map(arr => (arr.length ? (last = satisfactionOf(arr)) : last))
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, left: 'center' },
    grid: { left: 40, right: 50, top: 40, bottom: 24 },
    xAxis: { type: 'category', data: days.map(d => d.slice(5)) },
    yAxis: [{ type: 'value', name: '条', minInterval: 1 }, { type: 'value', name: '满意度', min: 0, max: 100 }],
    series: [
      { name: '反馈量', type: 'bar', barWidth: 12, data: byDay.map(a => a.length), itemStyle: { color: '#e3d3b5', borderRadius: [4, 4, 0, 0] } },
      { name: '满意度', type: 'line', yAxisIndex: 1, smooth: true, data: sat, itemStyle: { color: '#b83a2f' }, lineStyle: { width: 2.5 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(184,58,47,0.18)' }, { offset: 1, color: 'rgba(184,58,47,0)' }] } } }
    ]
  }
})

/* ---------- 操作 ---------- */
const detail = reactive({ visible: false, row: null })
const showDetail = row => Object.assign(detail, { visible: true, row })

function dispatch(row) {
  router.push({ path: '/workorder/create', query: { feedbackId: row.id } })
}

async function ignore(row) {
  await updateFeedbackStatus(row.id, '已忽略')
  ElMessage.success('已标记为忽略')
  load()
}

const mock = reactive({ visible: false, form: {} })
function openMock() {
  mock.form = { source: '游客', name: '小程序游客', scenic: '平遥古城', location: '', type: '设施故障', content: '' }
  mock.visible = true
}
const live = computed(() => analyzeFeedback({ content: mock.form.content || '', type: mock.form.type }))
async function submitMock() {
  await createFeedback({ ...mock.form })
  mock.visible = false
  ElMessage.success('已接收并完成智能分析')
  load()
}

function exportCsv() {
  const head = ['编号', '时间', '来源', '景区', '位置', '类型', '内容', '情感', '情感得分', '关键词', '风险指数', '状态']
  const rows = list.value.map(f => [f.id, f.createdAt, f.source, f.scenic, f.location, f.type, f.content, SENT[f.analysis.sentiment].name, f.analysis.score, f.analysis.keywords.join('/'), f.analysis.risk, f.status])
  const csv = '\uFEFF' + [head, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `反馈数据_${today}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

const sourceTag = s => ({ 游客: 'primary', 商户: 'success', 工作人员: 'warning' }[s])
const statusTag = s => ({ 待处理: 'warning', 已派单: 'primary', 已完成: 'success', 已忽略: 'info' }[s])
</script>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}
.stat {
  position: relative;
  overflow: hidden;
  background: #fffdf8;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 14px 18px 12px 20px;
  box-shadow: 0 1px 2px rgba(80, 60, 30, 0.04);
}
.stat::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--c);
}
.stat::after {
  content: '';
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 40px;
  height: 40px;
  opacity: 0.1;
  border: 5px solid var(--c);
  border-left-color: transparent;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 5px #fffdf8, inset 0 0 0 10px var(--c);
}
.stat-label {
  color: #8f857b;
  font-size: 13px;
}
.stat-value {
  font-family: var(--font-num);
  font-size: 30px;
  font-weight: 600;
  color: var(--c);
  margin: 6px 0 2px;
}
.stat-value small {
  font-size: 13px;
  margin-left: 4px;
  font-weight: 400;
  color: #8f857b;
}
.stat-sub {
  font-size: 12px;
  color: #a39a8f;
}
.charts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}
.card {
  position: relative;
  background: #fffdf8;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 16px 18px;
  box-shadow: 0 1px 2px rgba(80, 60, 30, 0.04), 0 4px 14px rgba(80, 60, 30, 0.04);
}
.card.trend {
  margin-bottom: 14px;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-family: var(--font-title);
  font-size: 17px;
  letter-spacing: 1px;
  line-height: 1.2;
  color: var(--mo);
}
.card-title::before {
  content: '';
  flex-shrink: 0;
  width: 4px;
  height: 16px;
  border-radius: 1px;
  background: linear-gradient(180deg, var(--zhu), var(--zhu-deep));
}
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.spacer {
  flex: 1;
}
.sub {
  color: #a39a8f;
  font-size: 12px;
}
.kw {
  display: inline-block;
  padding: 0 7px;
  margin: 2px 4px 2px 0;
  font-size: 12px;
  line-height: 20px;
  border-radius: 2px;
  background: #f3ece0;
  color: #7a5a2e;
  border: 1px solid #e6d8bf;
}
.pager {
  margin-top: 12px;
  justify-content: flex-end;
}
.h4 {
  margin: 20px 0 10px;
}
.muted {
  color: #a39a8f;
  font-size: 12px;
  margin-left: 8px;
}
.lv {
  margin-left: 8px;
  border: none;
}
.drawer-ops {
  margin-top: 20px;
}
.live {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 13px;
}
:deep(.el-table__row) {
  cursor: pointer;
}
</style>
