<template>
  <div class="track-page">
    <!-- 左侧列表 -->
    <div class="card list-card">
      <el-input v-model="keyword" placeholder="工单号 / 标题 / 描述" :prefix-icon="Search" clearable />
      <div class="stage-filter">
        <span v-for="s in STAGE_FILTERS" :key="s.key" :class="['sf', { on: stageKey === s.key }]" @click="stageKey = s.key">
          {{ s.name }}<em>{{ countBy(s.key) }}</em>
        </span>
      </div>
      <div v-loading="loading" class="orders">
        <div v-for="o in filtered" :key="o.id" :class="['order', { on: current && current.id === o.id }]" @click="select(o.id)">
          <div class="o-top">
            <span class="o-id">{{ o.id }}</span>
            <el-tag size="small" :type="priorityTag(o.priority)" effect="dark">{{ o.priority }}</el-tag>
          </div>
          <div class="o-title">{{ o.title }}</div>
          <div class="o-bottom">
            <span>{{ staffName(o.assignee) }}</span>
            <span :class="['o-stage', stageOf(o).key]">{{ stageLabel(o) }}</span>
            <span v-if="isOverdue(o)" class="overdue">已超时</span>
          </div>
        </div>
        <el-empty v-if="!filtered.length" description="无工单" :image-size="70" />
      </div>
    </div>

    <!-- 右侧详情 -->
    <div class="card detail-card">
      <el-empty v-if="!current" description="请选择左侧工单查看流程" />
      <template v-else>
        <div class="d-head">
          <div>
            <h3>{{ current.title }}</h3>
            <div class="d-meta">
              <span>工单号 {{ current.id }}</span>
              <span>类型 {{ current.type }}</span>
              <span>创建 {{ current.createdAt }}</span>
              <span :class="{ overdue: isOverdue(current) }">时限 {{ current.deadline }}</span>
              <span v-if="current.risk != null">风险指数 <b :style="{ color: riskLevel(current.risk).hex }">{{ current.risk }}</b></span>
            </div>
          </div>
          <el-tag size="large" :type="stageOf(current).key === 'finished' ? 'success' : 'primary'">{{ stageLabel(current) }}</el-tag>
        </div>

        <el-steps :active="doneCount" finish-status="success" align-center class="flow">
          <el-step v-for="s in current.stages" :key="s.key" :title="s.name" :description="s.time ? s.time.slice(5) : ''" />
        </el-steps>

        <el-descriptions :column="3" border size="small" class="info">
          <el-descriptions-item label="位置">{{ current.scenic }} · {{ current.location }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ staffName(current.assignee) }}</el-descriptions-item>
          <el-descriptions-item label="协助">{{ (current.assistants || []).map(staffName).join('、') || '—' }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ current.source }}{{ current.feedbackId ? ' · ' + current.feedbackId : '' }}</el-descriptions-item>
          <el-descriptions-item label="损伤识别">{{ current.damage ? `${current.damage.cls}（${(current.damage.confidence * 100).toFixed(0)}%）` : '—' }}</el-descriptions-item>
          <el-descriptions-item label="满意度"><el-rate v-if="current.satisfaction" :model-value="current.satisfaction" disabled size="small" /><span v-else>—</span></el-descriptions-item>
          <el-descriptions-item label="问题描述" :span="3">{{ current.description }}</el-descriptions-item>
          <el-descriptions-item v-if="current.images && current.images.length" label="现场照片" :span="3">
            <el-image v-for="(img, i) in current.images" :key="i" :src="img" :preview-src-list="current.images" fit="cover" class="thumb" />
          </el-descriptions-item>
        </el-descriptions>

        <div class="body">
          <div class="timeline">
            <div class="sec-title">流程记录</div>
            <el-timeline>
              <el-timeline-item v-for="s in current.stages.filter(x => x.done)" :key="s.key" :timestamp="s.time" placement="top" type="success" :hollow="false">
                <div class="tl-name">{{ s.name }} · {{ s.operator }}</div>
                <div class="tl-desc">{{ s.desc || '—' }}</div>
                <el-image v-for="(img, i) in s.images" :key="i" :src="img" :preview-src-list="s.images" fit="cover" class="thumb" />
              </el-timeline-item>
              <el-timeline-item :timestamp="current.createdAt" placement="top" color="#3b7ad9">
                <div class="tl-name">工单创建并派发</div>
              </el-timeline-item>
            </el-timeline>
          </div>

          <div v-if="nextStage" class="action">
            <div class="sec-title">确认「{{ nextStage.name }}」节点</div>
            <el-form label-position="top">
              <el-form-item :label="HINT[nextStage.key].label">
                <el-input v-model="act.desc" type="textarea" :rows="3" :placeholder="HINT[nextStage.key].placeholder" />
              </el-form-item>
              <el-form-item v-if="nextStage.key !== 'done'" label="现场图片">
                <el-upload list-type="picture-card" :auto-upload="false" accept="image/*" :file-list="act.files" :on-change="onImage" :on-remove="onRemove" :limit="4">
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item v-if="nextStage.key === 'accept'" label="验收结果">
                <el-radio-group v-model="act.pass">
                  <el-radio :value="true">验收合格</el-radio>
                  <el-radio :value="false">不合格，退回修复</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="nextStage.key === 'done'" label="反馈人满意度">
                <el-rate v-model="act.satisfaction" show-text :texts="['很不满意', '不满意', '一般', '满意', '非常满意']" />
              </el-form-item>
              <el-form-item label="操作人">
                <el-select v-model="act.operator" style="width: 100%">
                  <el-option v-for="n in operators" :key="n" :label="n" :value="n" />
                </el-select>
              </el-form-item>
              <el-button type="primary" :loading="saving" @click="confirm">确认{{ nextStage.name }}</el-button>
            </el-form>
          </div>
          <div v-else class="action finished">
            <el-result icon="success" title="工单已完成" :sub-title="`完成时间 ${current.finishedAt}`" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { listWorkorders, listStaff, confirmStage, currentStage, rejectAcceptance } from '@/api'
import { fmt } from '@/api/mockDb'
import { riskLevel } from '@/utils/nlp'
import { compressImage } from '@/utils/image'

const route = useRoute()
const router = useRouter()

const STAGE_FILTERS = [
  { key: 'all', name: '全部' },
  { key: 'receive', name: '待接收' },
  { key: 'repair', name: '修复中' },
  { key: 'feedback', name: '待反馈' },
  { key: 'accept', name: '待验收' },
  { key: 'done', name: '待完成' },
  { key: 'finished', name: '已完成' }
]
const HINT = {
  receive: { label: '接单说明', placeholder: '如：已接单，预计 30 分钟到达现场' },
  repair: { label: '检查与修复描述', placeholder: '描述现场检查结果和修复措施' },
  feedback: { label: '反馈内容', placeholder: '修复前后对比说明，将推送给反馈人' },
  accept: { label: '验收意见', placeholder: '验收人意见' },
  done: { label: '结单说明', placeholder: '归档说明' }
}

const orders = ref([])
const staff = ref([])
const loading = ref(false)
const keyword = ref('')
const stageKey = ref('all')
const currentId = ref('')
const saving = ref(false)
const act = reactive({ desc: '', files: [], images: [], operator: '', pass: true, satisfaction: 5 })

async function load() {
  loading.value = true
  ;[orders.value, staff.value] = await Promise.all([listWorkorders(), listStaff()])
  loading.value = false
}

onMounted(async () => {
  await load()
  const id = route.query.id
  select(id && orders.value.some(o => o.id === id) ? id : orders.value.find(o => stageOf(o).key !== 'finished')?.id)
})

const stageOf = o => currentStage(o)
const stageLabel = o => {
  const s = stageOf(o)
  return s.key === 'finished' ? '已完成' : STAGE_FILTERS.find(f => f.key === s.key).name
}
const countBy = key => (key === 'all' ? orders.value.length : orders.value.filter(o => stageOf(o).key === key).length)
const filtered = computed(() => orders.value.filter(o => {
  if (stageKey.value !== 'all' && stageOf(o).key !== stageKey.value) return false
  const k = keyword.value.trim()
  return !k || o.id.includes(k) || o.title.includes(k) || o.description.includes(k)
}))

const current = computed(() => orders.value.find(o => o.id === currentId.value))
const doneCount = computed(() => (current.value ? current.value.stages.filter(s => s.done).length : 0))
const nextStage = computed(() => current.value && current.value.stages.find(s => !s.done))
const operators = computed(() => {
  if (!current.value) return []
  const names = [staffName(current.value.assignee), ...(current.value.assistants || []).map(staffName)]
  const me = JSON.parse(localStorage.getItem('scenic-user') || '{}').nickname || '景区管理员'
  return [...new Set([...names, me])]
})

function select(id) {
  if (!id) return
  currentId.value = id
  resetAct()
  if (route.query.id !== id) router.replace({ query: { id } })
}

function resetAct() {
  const ns = current.value && current.value.stages.find(s => !s.done)
  Object.assign(act, {
    desc: '', files: [], images: [], pass: true, satisfaction: 5,
    operator: ns && (ns.key === 'accept' || ns.key === 'done') ? operators.value[operators.value.length - 1] : operators.value[0]
  })
}

async function onImage(file) {
  const url = await compressImage(file.raw)
  act.images.push(url)
  file.url = url
}
function onRemove(file) {
  const i = act.images.indexOf(file.url)
  if (i > -1) act.images.splice(i, 1)
}

async function confirm() {
  const stage = nextStage.value
  if (!act.desc.trim()) return ElMessage.warning('请填写' + HINT[stage.key].label)
  saving.value = true
  try {
    if (stage.key === 'accept' && !act.pass) {
      await rejectAcceptance(current.value.id, { reason: act.desc, operator: act.operator })
      ElMessage.warning('验收不合格，已退回修复环节')
    } else {
      await confirmStage(current.value.id, stage.key, { desc: act.desc, images: act.images, operator: act.operator, satisfaction: act.satisfaction })
      ElMessage.success(`「${stage.name}」节点已确认`)
    }
    const id = current.value.id
    await load()
    select(id)
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

const staffName = id => staff.value.find(s => s.id === id)?.name || id
const isOverdue = o => stageOf(o).key !== 'finished' && o.deadline && o.deadline < fmt(Date.now())
const priorityTag = p => ({ 紧急: 'danger', 高: 'warning', 中: 'primary', 低: 'info' }[p])
</script>

<style scoped>
.track-page {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.card {
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(15, 35, 80, 0.06);
}
.list-card {
  width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
}
.stage-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
}
.sf {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  background: #f2f5fa;
  color: #5a6477;
  cursor: pointer;
}
.sf em {
  font-style: normal;
  margin-left: 3px;
  color: #a0a8b8;
}
.sf.on {
  background: #3b7ad9;
  color: #fff;
}
.sf.on em {
  color: #dbe7ff;
}
.orders {
  max-height: calc(100vh - 290px);
  overflow-y: auto;
}
.order {
  padding: 10px 12px;
  border: 1px solid #edf0f5;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}
.order:hover {
  border-color: #b9cff5;
}
.order.on {
  border-color: #3b7ad9;
  background: #f4f8ff;
}
.o-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.o-id {
  font-size: 12px;
  color: #8a94a6;
  font-family: Consolas, monospace;
}
.o-title {
  font-weight: 600;
  color: #1f2d3d;
  margin: 4px 0;
  font-size: 14px;
}
.o-bottom {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #8a94a6;
}
.o-stage {
  color: #3b7ad9;
}
.o-stage.finished {
  color: #11b95c;
}
.overdue {
  color: #f56c6c !important;
}
.detail-card {
  flex: 1;
  min-width: 0;
  padding: 18px 22px;
}
.d-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.d-head h3 {
  margin: 0 0 6px;
  color: #1f2d3d;
}
.d-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #8a94a6;
}
.flow {
  margin: 22px 0;
}
.info {
  margin-bottom: 18px;
}
.body {
  display: flex;
  gap: 24px;
}
.timeline {
  flex: 1;
}
.action {
  width: 380px;
  flex-shrink: 0;
  background: #f8fafd;
  border-radius: 6px;
  padding: 14px 16px;
}
.action.finished {
  display: flex;
  align-items: center;
  justify-content: center;
}
.sec-title {
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #3b7ad9;
  line-height: 1;
}
.tl-name {
  font-weight: 600;
  color: #1f2d3d;
}
.tl-desc {
  font-size: 13px;
  color: #5a6477;
  margin: 4px 0;
}
.thumb {
  width: 72px;
  height: 72px;
  border-radius: 4px;
  margin-right: 6px;
}
:deep(.el-upload--picture-card),
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 72px;
  height: 72px;
}
</style>
