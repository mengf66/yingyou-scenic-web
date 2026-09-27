<template>
  <div class="create-page card">
    <el-steps :active="step" finish-status="success" align-center class="steps">
      <el-step title="问题确认" description="选择反馈 / 手动录入" />
      <el-step title="工单详情" description="完善处置信息" />
      <el-step title="分派设置" description="智能匹配处理人" />
      <el-step title="确认提交" description="核对并派发" />
    </el-steps>

    <!-- 1 问题确认 -->
    <div v-show="step === 0" class="pane">
      <el-radio-group v-model="mode" class="mode">
        <el-radio-button value="feedback">来自三方反馈</el-radio-button>
        <el-radio-button value="manual">巡检手动录入</el-radio-button>
      </el-radio-group>

      <template v-if="mode === 'feedback'">
        <el-table :data="pending" highlight-current-row max-height="330" :row-class-name="({ row }) => (row.id === form.feedbackId ? 'picked' : '')" @row-click="pickFeedback">
          <el-table-column width="46">
            <template #default="{ row }"><el-radio :model-value="form.feedbackId" :value="row.id" @change="pickFeedback(row)"><span></span></el-radio></template>
          </el-table-column>
          <el-table-column prop="createdAt" label="时间" width="140" />
          <el-table-column prop="source" label="来源" width="80" />
          <el-table-column label="位置" width="170"><template #default="{ row }">{{ row.scenic }} · {{ row.location }}</template></el-table-column>
          <el-table-column prop="type" label="类型" width="90" />
          <el-table-column prop="content" label="内容" show-overflow-tooltip />
          <el-table-column label="风险" width="80" sortable :sort-method="(a, b) => a.analysis.risk - b.analysis.risk">
            <template #default="{ row }"><b :style="{ color: riskLevel(row.analysis.risk).hex }">{{ row.analysis.risk }}</b></template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!pending.length" description="暂无待处理反馈，可切换为「巡检手动录入」" :image-size="80" />
      </template>

      <el-form v-else :model="form" label-width="90px" class="manual">
        <el-form-item label="景区"><el-select v-model="form.scenic" style="width: 100%"><el-option v-for="s in SCENICS" :key="s" :label="s" :value="s" /></el-select></el-form-item>
        <el-form-item label="位置"><el-input v-model="form.location" placeholder="如：南门瓮城" /></el-form-item>
        <el-form-item label="问题类型"><el-select v-model="form.type" style="width: 100%"><el-option v-for="t in FEEDBACK_TYPES" :key="t" :label="t" :value="t" /></el-select></el-form-item>
        <el-form-item label="问题描述"><el-input v-model="form.description" type="textarea" :rows="3" placeholder="描述现场情况" /></el-form-item>
      </el-form>

      <div v-if="confirmed" class="confirm-box">
        <div class="cb-title">问题确认</div>
        <div class="cb-row">
          <span>风险指数 <b :style="{ color: level.hex }">{{ form.risk }}</b></span>
          <el-tag :color="level.hex" effect="dark" class="lv">{{ level.color }}预警 {{ level.level }}</el-tag>
          <span>建议优先级：<b>{{ suggestPriority }}</b></span>
          <span v-if="analysis">情感：{{ { positive: '正面', neutral: '中性', negative: '负面' }[analysis.sentiment] }}（{{ analysis.score }}）</span>
          <span v-if="analysis && analysis.keywords.length">关键词：<span v-for="k in analysis.keywords" :key="k" class="kw">{{ k }}</span></span>
        </div>
        <div v-if="form.type === '古建损伤'" class="damage">
          <el-icon><Aim /></el-icon>
          <span>古建损伤识别（改进 YOLO11，6 类）：</span>
          <el-select v-model="form.damage.cls" size="small" style="width: 130px">
            <el-option v-for="c in DAMAGE_CLASSES" :key="c" :label="c" :value="c" />
          </el-select>
          <span>置信度 <b>{{ (form.damage.confidence * 100).toFixed(0) }}%</b></span>
          <span class="muted">{{ form.damage.by }}</span>
        </div>
      </div>
    </div>

    <!-- 2 工单详情 -->
    <el-form v-show="step === 1" ref="detailRef" :model="form" :rules="rules" label-width="100px" class="pane detail">
      <el-form-item label="工单标题" prop="title"><el-input v-model="form.title" maxlength="40" show-word-limit /></el-form-item>
      <el-row :gutter="16">
        <el-col :span="12"><el-form-item label="问题类型" prop="type"><el-select v-model="form.type" style="width: 100%"><el-option v-for="t in FEEDBACK_TYPES" :key="t" :label="t" :value="t" /></el-select></el-form-item></el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-radio-group v-model="form.priority" @change="autoDeadline">
              <el-radio-button v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12"><el-form-item label="景区" prop="scenic"><el-select v-model="form.scenic" style="width: 100%"><el-option v-for="s in SCENICS" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="具体位置" prop="location"><el-input v-model="form.location" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="问题描述" prop="description"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="现场照片">
        <el-upload list-type="picture-card" :auto-upload="false" accept="image/*" :file-list="fileList" :on-change="onImage" :on-remove="onRemoveImage" :limit="4">
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="处理时限" prop="deadline">
            <el-date-picker v-model="form.deadline" type="datetime" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12"><el-form-item label="备注"><el-input v-model="form.remark" placeholder="选填" /></el-form-item></el-col>
      </el-row>
    </el-form>

    <!-- 3 分派设置 -->
    <div v-show="step === 2" class="pane">
      <div class="tip">
        <el-icon><MagicStick /></el-icon>
        智能匹配：综合 <b>技能匹配度 50%</b> + <b>当前负载 30%</b> + <b>历史满意度 20%</b> 为处理人打分（协同过滤推荐），默认选中最高分人员。
      </div>
      <el-table :data="rankedStaff" @row-click="row => (form.assignee = row.id)">
        <el-table-column width="46">
          <template #default="{ row }"><el-radio v-model="form.assignee" :value="row.id"><span></span></el-radio></template>
        </el-table-column>
        <el-table-column label="处理人" width="140">
          <template #default="{ row, $index }">{{ row.name }} <el-tag v-if="$index === 0" size="small" type="success">推荐</el-tag></template>
        </el-table-column>
        <el-table-column prop="dept" label="部门" width="120" />
        <el-table-column label="技能" min-width="160">
          <template #default="{ row }"><el-tag v-for="s in row.skills" :key="s" size="small" :type="s === form.type ? 'primary' : 'info'" effect="plain" class="sk">{{ s }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="active" label="在办工单" width="90" />
        <el-table-column label="满意度" width="90"><template #default="{ row }">{{ row.avgSatisfaction ?? '—' }}</template></el-table-column>
        <el-table-column label="匹配得分" width="170">
          <template #default="{ row }"><el-progress :percentage="row.score" :stroke-width="8" /></template>
        </el-table-column>
      </el-table>
      <el-form label-width="110px" class="assign">
        <el-form-item label="协助人员">
          <el-select v-model="form.assistants" multiple placeholder="选填" style="width: 360px">
            <el-option v-for="s in staff.filter(x => x.id !== form.assignee)" :key="s.id" :label="`${s.name}（${s.dept}）`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知反馈人">
          <el-switch v-model="form.notifyTourist" /> <span class="muted">处置进度将通过小程序实时推送给反馈人</span>
        </el-form-item>
      </el-form>
    </div>

    <!-- 4 确认提交 -->
    <div v-show="step === 3" class="pane">
      <el-result v-if="created" icon="success" :title="`工单 ${created.id} 已派发`" :sub-title="`已通知处理人 ${staffName(created.assignee)}，可在「工单流程追踪」中查看进度`">
        <template #extra>
          <el-button type="primary" @click="router.push({ path: '/workorder/track', query: { id: created.id } })">查看工单</el-button>
          <el-button @click="restart">继续创建</el-button>
        </template>
      </el-result>
      <el-descriptions v-else :column="2" border title="请核对工单信息">
        <el-descriptions-item label="工单标题" :span="2">{{ form.title }}</el-descriptions-item>
        <el-descriptions-item label="问题类型">{{ form.type }}</el-descriptions-item>
        <el-descriptions-item label="优先级"><el-tag :type="priorityTag(form.priority)">{{ form.priority }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="位置">{{ form.scenic }} · {{ form.location }}</el-descriptions-item>
        <el-descriptions-item label="处理时限">{{ form.deadline }}</el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">{{ form.description }}</el-descriptions-item>
        <el-descriptions-item label="风险指数">{{ form.risk }}（{{ level.color }}预警）</el-descriptions-item>
        <el-descriptions-item label="关联反馈">{{ form.feedbackId || '无（巡检录入）' }}</el-descriptions-item>
        <el-descriptions-item v-if="form.type === '古建损伤'" label="损伤识别" :span="2">{{ form.damage.cls }}（置信度 {{ (form.damage.confidence * 100).toFixed(0) }}%）</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ staffName(form.assignee) }}</el-descriptions-item>
        <el-descriptions-item label="协助人员">{{ form.assistants.map(staffName).join('、') || '无' }}</el-descriptions-item>
        <el-descriptions-item label="现场照片" :span="2">
          <el-image v-for="(img, i) in form.images" :key="i" :src="img" :preview-src-list="form.images" class="thumb" fit="cover" />
          <span v-if="!form.images.length" class="muted">未上传</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-if="!created" class="footer">
      <el-button v-if="step > 0" @click="step--">上一步</el-button>
      <el-button v-if="step < 3" type="primary" @click="next">下一步</el-button>
      <el-button v-else type="primary" :loading="submitting" @click="submit">确认提交并派单</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Aim, MagicStick } from '@element-plus/icons-vue'
import { listFeedbacks, listStaff, createWorkorder } from '@/api'
import { SCENICS, FEEDBACK_TYPES, PRIORITIES, DAMAGE_CLASSES, fmt } from '@/api/mockDb'
import { analyzeFeedback, riskLevel } from '@/utils/nlp'
import { detectDamage } from '@/utils/damage'
import { compressImage } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const step = ref(0)
const mode = ref('feedback')
const pending = ref([])
const staff = ref([])
const created = ref(null)
const submitting = ref(false)
const detailRef = ref()
const fileList = ref([])

const emptyForm = () => ({
  feedbackId: '', source: '工作人员', title: '', type: '设施故障', priority: '中', scenic: '平遥古城', location: '', description: '',
  images: [], deadline: '', remark: '', risk: 0, damage: { cls: '剥落', confidence: 0.7, by: '' }, assignee: '', assistants: [], notifyTourist: true
})
const form = reactive(emptyForm())

const rules = {
  title: [{ required: true, message: '请填写工单标题', trigger: 'blur' }],
  type: [{ required: true }],
  priority: [{ required: true }],
  scenic: [{ required: true, message: '请选择景区' }],
  location: [{ required: true, message: '请填写具体位置', trigger: 'blur' }],
  description: [{ required: true, message: '请填写问题描述', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择处理时限' }]
}

onMounted(async () => {
  ;[pending.value, staff.value] = await Promise.all([listFeedbacks({ status: '待处理' }), listStaff()])
  pending.value.sort((a, b) => b.analysis.risk - a.analysis.risk)
  const id = route.query.feedbackId
  const fb = id && pending.value.find(f => f.id === id)
  if (fb) pickFeedback(fb)
})

/* ---------- 问题确认 ---------- */
const analysis = computed(() => (form.description ? analyzeFeedback({ content: form.description, type: form.type }) : null))
const confirmed = computed(() => (mode.value === 'feedback' ? !!form.feedbackId : !!form.description))
const level = computed(() => riskLevel(form.risk))
const suggestPriority = computed(() => (form.risk >= 75 ? '紧急' : form.risk >= 55 ? '高' : form.risk >= 35 ? '中' : '低'))

async function pickFeedback(fb) {
  Object.assign(form, {
    feedbackId: fb.id, source: fb.source, type: fb.type, scenic: fb.scenic, location: fb.location, description: fb.content,
    risk: fb.analysis.risk, images: [...(fb.images || [])]
  })
  fileList.value = form.images.map((url, i) => ({ name: 'img' + i, url }))
  if (fb.type === '古建损伤') form.damage = await detectDamage({ text: fb.content, image: fb.images?.[0] })
}

async function syncManual() {
  const a = analyzeFeedback({ content: form.description, type: form.type })
  form.risk = a.risk
  form.feedbackId = ''
  form.source = '工作人员'
  if (form.type === '古建损伤') form.damage = await detectDamage({ text: form.description, image: form.images[0] })
}

function autoDeadline() {
  const hours = { 紧急: 4, 高: 24, 中: 72, 低: 168 }[form.priority]
  form.deadline = fmt(Date.now() + hours * 3600000)
}

/* ---------- 图片 ---------- */
async function onImage(file) {
  const url = await compressImage(file.raw)
  form.images.push(url)
  file.url = url
  if (form.type === '古建损伤') form.damage = await detectDamage({ text: form.description, image: url })
}
function onRemoveImage(file) {
  const i = form.images.indexOf(file.url)
  if (i > -1) form.images.splice(i, 1)
}

/* ---------- 智能分派 ---------- */
const rankedStaff = computed(() => {
  const maxActive = Math.max(1, ...staff.value.map(s => s.active))
  return staff.value.map(s => {
    const skill = s.skills.includes(form.type) ? 1 : 0
    const load = 1 - s.active / maxActive
    const sat = (s.avgSatisfaction ?? 4) / 5
    return { ...s, score: Math.round(skill * 50 + load * 30 + sat * 20) }
  }).sort((a, b) => b.score - a.score)
})
const staffName = id => staff.value.find(s => s.id === id)?.name || id

/* ---------- 步骤控制 ---------- */
async function next() {
  if (step.value === 0) {
    if (mode.value === 'feedback' && !form.feedbackId) return ElMessage.warning('请选择一条待处理反馈')
    if (mode.value === 'manual') {
      if (!form.location || !form.description) return ElMessage.warning('请填写位置和问题描述')
      await syncManual()
    }
    form.priority = suggestPriority.value
    form.title = form.title || `${form.scenic}·${form.location}${form.type}`
    autoDeadline()
  }
  if (step.value === 1) {
    await detailRef.value.validate()
    if (!form.assignee) form.assignee = rankedStaff.value[0]?.id // 默认选中匹配得分最高的处理人
  }
  if (step.value === 2 && !form.assignee) return ElMessage.warning('请选择处理人')
  step.value++
}

async function submit() {
  if (!form.assignee) return ElMessage.warning('请选择处理人')
  submitting.value = true
  try {
    created.value = await createWorkorder({ ...form, damage: form.type === '古建损伤' ? { cls: form.damage.cls, confidence: form.damage.confidence } : null })
    ElMessage.success('派单成功')
  } finally {
    submitting.value = false
  }
}

async function restart() {
  Object.assign(form, emptyForm())
  fileList.value = []
  created.value = null
  step.value = 0
  pending.value = (await listFeedbacks({ status: '待处理' })).sort((a, b) => b.analysis.risk - a.analysis.risk)
  staff.value = await listStaff()
  router.replace({ query: {} })
}

const priorityTag = p => ({ 紧急: 'danger', 高: 'warning', 中: 'primary', 低: 'info' }[p])
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 8px;
  padding: 24px 28px;
  box-shadow: 0 1px 4px rgba(15, 35, 80, 0.06);
}
.steps {
  margin-bottom: 26px;
}
.pane {
  min-height: 360px;
}
.mode {
  margin-bottom: 14px;
}
.manual {
  max-width: 640px;
}
:deep(.picked) {
  --el-table-tr-bg-color: #ecf5ff;
}
.confirm-box {
  margin-top: 16px;
  background: #f6f9ff;
  border: 1px solid #dbe6fb;
  border-radius: 6px;
  padding: 12px 16px;
}
.cb-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #2a5bac;
}
.cb-row,
.damage {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #5a6477;
}
.damage {
  margin-top: 10px;
  gap: 8px;
}
.lv {
  border: none;
}
.kw {
  display: inline-block;
  padding: 0 6px;
  margin-right: 4px;
  font-size: 12px;
  border-radius: 3px;
  background: #eef4ff;
  color: #3b7ad9;
}
.detail {
  max-width: 860px;
}
.tip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f0f9eb;
  color: #3f7a26;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 12px;
}
.sk {
  margin-right: 4px;
}
.assign {
  margin-top: 18px;
}
.muted {
  color: #a0a8b8;
  font-size: 12px;
  margin-left: 8px;
}
.thumb {
  width: 80px;
  height: 80px;
  margin-right: 8px;
  border-radius: 4px;
}
.footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #eef1f6;
}
</style>
