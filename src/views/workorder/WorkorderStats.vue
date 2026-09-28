<template>
  <div class="stats-page">
    <div class="kpis">
      <div v-for="k in kpis" :key="k.label" class="kpi" :style="{ '--c': k.color }">
        <div class="k-label">{{ k.label }}</div>
        <div class="k-value">{{ k.value }}<small>{{ k.unit }}</small></div>
      </div>
    </div>

    <div class="grid g3">
      <div class="card"><div class="card-title">工单状态分布</div><EChart :option="stageOption" height="260px" /></div>
      <div class="card"><div class="card-title">各类问题平均处置时长（小时）</div><EChart :option="durationOption" height="260px" /></div>
      <div class="card"><div class="card-title">景区工单分布</div><EChart :option="scenicOption" height="260px" /></div>
    </div>

    <div class="card mb">
      <div class="card-title">近 30 天工单量与满意度趋势</div>
      <EChart :option="trendOption" height="260px" />
    </div>

    <div class="grid g2">
      <div class="card"><div class="card-title">人员工作量与处置效率</div><EChart :option="staffOption" height="300px" /></div>
      <div class="card">
        <div class="card-title">处置效率评估</div>
        <el-table :data="staffTable" size="small" height="300">
          <el-table-column prop="name" label="处理人" width="80" />
          <el-table-column prop="dept" label="部门" width="100" />
          <el-table-column prop="finished" label="已完成" width="70" sortable />
          <el-table-column prop="active" label="在办" width="60" sortable />
          <el-table-column prop="avgHours" label="平均时长(h)" width="100" sortable />
          <el-table-column prop="onTime" label="按时率" width="80" sortable>
            <template #default="{ row }">{{ row.onTime }}%</template>
          </el-table-column>
          <el-table-column label="满意度" min-width="120">
            <template #default="{ row }"><el-rate v-if="row.sat" :model-value="row.sat" disabled allow-half size="small" /><span v-else>—</span></template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="section-title">
      <span>古城损伤工单 · 全民参与 + 智能分析</span>
      <small>游客通过小程序上传古建破损照片，改进 YOLO11 自动识别 6 类损伤并生成修复工单</small>
    </div>
    <div class="grid g3">
      <div class="card"><div class="card-title">损伤类型分布</div><EChart :option="damageOption" height="300px" /></div>
      <div class="card"><div class="card-title">损伤点位 TOP10</div><EChart :option="topOption" height="300px" /></div>
      <div class="card">
        <div class="card-title">损伤工单来源</div>
        <EChart :option="damageSourceOption" height="170px" />
        <div class="model">
          <div>检测模型：改进 YOLO11</div>
          <div>mAP50 <b>+4.4%</b> · mAP50-95 <b>+4.0%</b>（相较 YOLO11 基线）</div>
          <div>识别类别：{{ DAMAGE_CLASSES.join('、') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EChart from '@/components/common/EChart.vue'
import { listWorkorders, listStaff, currentStage } from '@/api'
import { DAMAGE_CLASSES, FEEDBACK_TYPES, fmt } from '@/api/mockDb'

const orders = ref([])
const staff = ref([])
onMounted(async () => {
  ;[orders.value, staff.value] = await Promise.all([listWorkorders(), listStaff()])
})

const toTime = s => new Date(s.replace(/-/g, '/')).getTime()
const hoursOf = o => (o.finishedAt ? (toTime(o.finishedAt) - toTime(o.createdAt)) / 3600000 : null)
const finished = computed(() => orders.value.filter(o => o.finishedAt))
const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
const COLORS = ['#b83a2f', '#3f7a5f', '#c9892f', '#c2413a', '#6b5b95', '#3d7f8c', '#b9786a', '#8f857b']

const kpis = computed(() => {
  const all = orders.value
  const fin = finished.value
  const nowStr = fmt(Date.now())
  const overdue = all.filter(o => (o.finishedAt ? o.finishedAt > o.deadline : o.deadline < nowStr)).length
  const sats = fin.filter(o => o.satisfaction).map(o => o.satisfaction)
  return [
    { label: '工单总数', value: all.length, unit: '单', color: '#b83a2f' },
    { label: '已完成', value: fin.length, unit: '单', color: '#3f7a5f' },
    { label: '完成率', value: all.length ? ((fin.length / all.length) * 100).toFixed(1) : 0, unit: '%', color: '#3d7f8c' },
    { label: '平均处置时长', value: avg(fin.map(hoursOf)).toFixed(1), unit: 'h', color: '#6b5b95' },
    { label: '超时率', value: all.length ? ((overdue / all.length) * 100).toFixed(1) : 0, unit: '%', color: '#c2413a' },
    { label: '平均满意度', value: avg(sats).toFixed(2), unit: '/5', color: '#c9892f' }
  ]
})

const stageOption = computed(() => {
  const names = { receive: '待接收', repair: '修复中', feedback: '待反馈', accept: '待验收', done: '待完成', finished: '已完成' }
  const cnt = {}
  orders.value.forEach(o => { const k = currentStage(o).key; cnt[k] = (cnt[k] || 0) + 1 })
  return {
    color: COLORS,
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
    series: [{ type: 'pie', radius: ['42%', '66%'], center: ['50%', '44%'], label: { formatter: '{b}\n{c}' }, data: Object.entries(names).map(([k, name]) => ({ name, value: cnt[k] || 0 })).filter(d => d.value) }]
  }
})

const durationOption = computed(() => {
  const data = FEEDBACK_TYPES.map(t => ({ t, h: avg(finished.value.filter(o => o.type === t).map(hoursOf)) })).filter(d => d.h > 0).sort((a, b) => b.h - a.h)
  return {
    grid: { left: 70, right: 40, top: 10, bottom: 20 },
    tooltip: { valueFormatter: v => v + ' 小时' },
    xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    yAxis: { type: 'category', inverse: true, data: data.map(d => d.t) },
    series: [{ type: 'bar', barWidth: 12, data: data.map(d => Number(d.h.toFixed(1))), label: { show: true, position: 'right' }, itemStyle: { color: '#6b5b95', borderRadius: [0, 6, 6, 0] } }]
  }
})

const scenicOption = computed(() => {
  const cnt = {}
  orders.value.forEach(o => (cnt[o.scenic] = (cnt[o.scenic] || 0) + 1))
  const arr = Object.entries(cnt).sort((a, b) => b[1] - a[1])
  return {
    color: COLORS,
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', roseType: 'area', radius: ['15%', '70%'], label: { formatter: '{b} {c}' }, data: arr.map(([name, value]) => ({ name, value })) }]
  }
})

const trendOption = computed(() => {
  const days = [...Array(30)].map((_, i) => fmt(Date.now() - (29 - i) * 86400000).slice(0, 10))
  const created = days.map(d => orders.value.filter(o => o.createdAt.startsWith(d)).length)
  const done = days.map(d => finished.value.filter(o => o.finishedAt.startsWith(d)).length)
  const sat = days.map(d => {
    const s = finished.value.filter(o => o.finishedAt.startsWith(d) && o.satisfaction).map(o => o.satisfaction)
    return s.length ? Number(avg(s).toFixed(2)) : null
  })
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, left: 'center' },
    grid: { left: 40, right: 50, top: 44, bottom: 24 },
    xAxis: { type: 'category', data: days.map(d => d.slice(5)) },
    yAxis: [{ type: 'value', name: '单', minInterval: 1 }, { type: 'value', name: '满意度', min: 0, max: 5 }],
    series: [
      { name: '新建工单', type: 'bar', barGap: 0, barWidth: 8, data: created, itemStyle: { color: '#dc9d97' } },
      { name: '完成工单', type: 'bar', barWidth: 8, data: done, itemStyle: { color: '#3f7a5f' } },
      { name: '满意度', type: 'line', yAxisIndex: 1, smooth: true, connectNulls: true, data: sat, itemStyle: { color: '#c9892f' } }
    ]
  }
})

const staffTable = computed(() => staff.value.map(s => {
  const mine = finished.value.filter(o => o.assignee === s.id)
  const onTime = mine.filter(o => o.finishedAt <= o.deadline).length
  const sats = mine.filter(o => o.satisfaction).map(o => o.satisfaction)
  return {
    ...s,
    avgHours: Number(avg(mine.map(hoursOf)).toFixed(1)),
    onTime: mine.length ? Math.round((onTime / mine.length) * 100) : 0,
    sat: sats.length ? Math.round(avg(sats) * 2) / 2 : 0
  }
}))

const staffOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { top: 0, left: 'center' },
  grid: { left: 40, right: 50, top: 44, bottom: 24 },
  xAxis: { type: 'category', data: staffTable.value.map(s => s.name) },
  yAxis: [{ type: 'value', name: '单', minInterval: 1 }, { type: 'value', name: '按时率%', max: 100 }],
  series: [
    { name: '已完成', type: 'bar', stack: 'w', barWidth: 18, data: staffTable.value.map(s => s.finished), itemStyle: { color: '#b83a2f' } },
    { name: '在办', type: 'bar', stack: 'w', data: staffTable.value.map(s => s.active), itemStyle: { color: '#c9892f', borderRadius: [4, 4, 0, 0] } },
    { name: '按时率', type: 'line', yAxisIndex: 1, data: staffTable.value.map(s => s.onTime), itemStyle: { color: '#3f7a5f' } }
  ]
}))

const damageOrders = computed(() => orders.value.filter(o => o.type === '古建损伤' && o.damage))

const damageOption = computed(() => {
  const cnt = DAMAGE_CLASSES.map(c => damageOrders.value.filter(o => o.damage.cls === c).length)
  const max = Math.max(4, ...cnt)
  return {
    tooltip: {},
    radar: { radius: '62%', indicator: DAMAGE_CLASSES.map(name => ({ name, max })), axisName: { color: '#5c534c' } },
    series: [{ type: 'radar', data: [{ value: cnt, name: '损伤工单数', areaStyle: { color: 'rgba(194,65,58,0.2)' }, itemStyle: { color: '#c2413a' } }], label: { show: true } }]
  }
})

const topOption = computed(() => {
  const cnt = {}
  damageOrders.value.forEach(o => { const k = `${o.scenic}·${o.location}`; cnt[k] = (cnt[k] || 0) + 1 })
  const arr = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 10)
  return {
    grid: { left: 130, right: 30, top: 6, bottom: 10 },
    tooltip: {},
    xAxis: { type: 'value', minInterval: 1, show: false },
    yAxis: { type: 'category', inverse: true, data: arr.map(a => a[0]), axisLabel: { fontSize: 11 }, axisTick: { show: false } },
    series: [{
      type: 'bar', barWidth: 10, label: { show: true, position: 'right' },
      data: arr.map((a, i) => ({ value: a[1], itemStyle: { borderRadius: 5, color: i < 3 ? '#c2413a' : '#d97a34' } }))
    }]
  }
})

const damageSourceOption = computed(() => {
  const cnt = {}
  damageOrders.value.forEach(o => (cnt[o.source] = (cnt[o.source] || 0) + 1))
  return {
    color: ['#b83a2f', '#c9892f', '#3f7a5f'],
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'middle' },
    series: [{ type: 'pie', radius: ['45%', '72%'], center: ['35%', '50%'], label: { show: false }, data: Object.entries(cnt).map(([name, value]) => ({ name, value })) }]
  }
})
</script>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}
.kpi {
  position: relative;
  overflow: hidden;
  background: #fffdf8;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 14px 18px 12px 20px;
  box-shadow: 0 1px 2px rgba(80, 60, 30, 0.04);
}
.kpi::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--c);
}
.kpi::after {
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
.k-label {
  font-size: 13px;
  color: #8f857b;
}
.k-value {
  font-family: var(--font-num);
  font-size: 28px;
  font-weight: 600;
  color: var(--c);
  margin-top: 4px;
}
.k-value small {
  font-size: 13px;
  font-weight: 400;
  color: #8f857b;
  margin-left: 3px;
}
.grid {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}
.g3 {
  grid-template-columns: repeat(3, 1fr);
}
.g2 {
  grid-template-columns: 1.2fr 1fr;
}
.card {
  position: relative;
  background: #fffdf8;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 16px 18px;
  box-shadow: 0 1px 2px rgba(80, 60, 30, 0.04), 0 4px 14px rgba(80, 60, 30, 0.04);
}
.mb {
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
.section-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 26px 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #dccfb8;
}
.section-title span {
  font-family: var(--font-title);
  font-size: 19px;
  letter-spacing: 2px;
  color: var(--mo);
}
.section-title small {
  color: #8f857b;
}
.model {
  background: #faefed;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
  color: #5c534c;
  line-height: 1.9;
}
.model b {
  color: #c2413a;
}
</style>
