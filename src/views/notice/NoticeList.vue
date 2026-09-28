<template>
  <div class="notice-page">
    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>发布公告</h3>
          <p class="desc">发布景区活动通知、开放调整、安全预警等信息，一键投递到游客端、目标景区及社交平台</p>
        </div>
        <el-button type="primary" :icon="Plus" @click="openEditor()">新建公告</el-button>
      </div>

      <div class="filters">
        <el-input v-model="query.keyword" placeholder="搜索标题 / 内容" :prefix-icon="Search" clearable style="width: 240px" @change="load" />
        <el-select v-model="query.type" placeholder="公告类型" clearable style="width: 150px" @change="load">
          <el-option v-for="t in NOTICE_TYPES" :key="t" :label="t" :value="t" />
        </el-select>
        <el-radio-group v-model="query.status" @change="load">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="published">已发布</el-radio-button>
          <el-radio-button value="draft">草稿</el-radio-button>
        </el-radio-group>
        <span class="count">共 {{ list.length }} 条</span>
      </div>

      <div v-loading="loading" class="list">
        <el-empty v-if="!list.length && !loading" description="暂无公告" />
        <div v-for="n in list" :key="n.id" class="item">
          <div class="item-main">
            <div class="item-title">
              <el-tag :type="typeTag(n.type)" size="small" effect="dark">{{ n.type }}</el-tag>
              <span class="t">{{ n.title }}</span>
              <el-tag v-if="n.status === 'draft'" type="info" size="small">草稿</el-tag>
            </div>
            <p class="item-content">{{ n.content }}</p>
            <div class="item-meta">
              <el-tag v-for="c in channelLabels(n)" :key="c" size="small" effect="plain" class="ch">{{ c }}</el-tag>
              <el-tag v-for="s in n.scenic" :key="s" size="small" type="success" effect="plain" class="ch">{{ s }}</el-tag>
            </div>
          </div>
          <div class="item-side">
            <div class="ops">
              <el-button link type="primary" :icon="Edit" @click="openEditor(n)">编辑</el-button>
              <el-button v-if="n.status === 'draft'" link type="success" :icon="Promotion" @click="publish(n)">发布</el-button>
              <el-popconfirm title="确定删除该公告？" @confirm="remove(n)">
                <template #reference><el-button link type="danger" :icon="Delete">删除</el-button></template>
              </el-popconfirm>
            </div>
            <div class="time">{{ n.updatedAt }}</div>
            <div class="views" v-if="n.status === 'published'">触达 {{ n.views.toLocaleString() }} 人次</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑公告 -->
    <el-dialog v-model="editor.visible" :title="editor.form.id ? '编辑公告' : '新建公告'" width="1000px" top="5vh" destroy-on-close>
      <div class="editor">
        <el-form ref="formRef" :model="editor.form" :rules="rules" label-position="top" class="editor-form">
          <el-form-item label="公告标题" prop="title">
            <el-input v-model="editor.form.title" maxlength="30" show-word-limit placeholder="如：平遥古城夜间开放时间调整" />
          </el-form-item>
          <el-form-item label="公告类型" prop="type">
            <el-select v-model="editor.form.type" style="width: 100%">
              <el-option v-for="t in NOTICE_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="公告内容" prop="content">
            <el-input v-model="editor.form.content" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入公告内容" />
          </el-form-item>
          <el-form-item label="发布渠道" prop="channels" class="channels">
            <div class="ch-group">
              <el-checkbox :model-value="editor.form.channels.tourist.length > 0" :indeterminate="editor.form.channels.tourist.length === 1" @change="v => (editor.form.channels.tourist = v ? ['banner', 'message'] : [])">
                <el-tag size="small" type="danger" effect="dark">游客端</el-tag>
              </el-checkbox>
              <el-checkbox-group v-model="editor.form.channels.tourist" class="sub">
                <el-checkbox value="banner">首页Banner</el-checkbox>
                <el-checkbox value="message">消息通知（订阅用户）</el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="ch-group">
              <el-checkbox :model-value="editor.form.scenic.length > 0" :indeterminate="editor.form.scenic.length > 0 && editor.form.scenic.length < SCENICS.length" @change="v => (editor.form.scenic = v ? [...SCENICS] : [])">
                <el-tag size="small" type="success" effect="dark">景区管辖区</el-tag>
              </el-checkbox>
              <el-checkbox-group v-model="editor.form.scenic" class="sub">
                <el-checkbox v-for="s in SCENICS" :key="s" :value="s">{{ s }}</el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="ch-group">
              <el-checkbox :model-value="editor.form.channels.social.length > 0" :indeterminate="editor.form.channels.social.length === 1" @change="v => (editor.form.channels.social = v ? ['wechat', 'douyin'] : [])">
                <el-tag size="small" type="warning" effect="dark">社交平台</el-tag>
              </el-checkbox>
              <el-checkbox-group v-model="editor.form.channels.social" class="sub">
                <el-checkbox value="wechat">微信公众号</el-checkbox>
                <el-checkbox value="douyin">抖音官方账号</el-checkbox>
              </el-checkbox-group>
            </div>
          </el-form-item>
        </el-form>

        <div class="preview">
          <div class="preview-head">
            <span>游客端展示预览</span>
            <div class="themes">
              背景图
              <span v-for="t in THEMES" :key="t.key" :class="['swatch', t.key, { on: editor.form.theme === t.key }]" @click="editor.form.theme = t.key">
                <el-icon v-if="editor.form.theme === t.key"><Check /></el-icon>
              </span>
            </div>
          </div>
          <div :class="['phone', editor.form.theme]">
            <div class="phone-bar">山西智慧旅游</div>
            <div class="phone-body">
              <div v-if="editor.form.channels.tourist.includes('banner')" class="banner">
                <span class="badge">{{ editor.form.type || '公告' }}</span>
                <div class="b-title">{{ editor.form.title || '公告标题' }}</div>
                <div class="b-text">{{ editor.form.content || '公告内容将在这里展示' }}</div>
              </div>
              <div v-if="editor.form.channels.tourist.includes('message')" class="msg">
                <el-icon class="msg-ico"><BellFilled /></el-icon>
                <div>
                  <div class="m-title">{{ editor.form.title || '公告标题' }}</div>
                  <div class="m-text">{{ editor.form.content || '公告内容' }}</div>
                </div>
              </div>
              <div v-if="editor.form.scenic.length" class="scope">
                <div class="scope-t">推送至景区管辖区：</div>
                <span v-for="s in editor.form.scenic" :key="s" class="scope-tag">{{ s }}</span>
              </div>
              <div v-if="!editor.form.channels.tourist.length" class="none">未勾选游客端渠道，游客端不展示</div>
            </div>
            <div class="phone-foot"></div>
          </div>
          <p class="preview-tip">以上为游客端展示效果预览</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="editor.visible = false">取消</el-button>
        <el-button @click="submit('draft')">存为草稿</el-button>
        <el-button type="primary" :loading="saving" @click="submit('published')">{{ editor.form.id ? '保存修改' : '立即发布' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Edit, Delete, Promotion, Check, BellFilled } from '@element-plus/icons-vue'
import { listNotices, saveNotice, deleteNotice } from '@/api'
import { SCENICS, NOTICE_TYPES } from '@/api/mockDb'

const THEMES = [{ key: 'blue' }, { key: 'gold' }, { key: 'beige' }]
const CHANNEL_NAME = { banner: '首页Banner', message: '消息通知', wechat: '微信公众号', douyin: '抖音' }

const query = reactive({ keyword: '', type: '', status: '' })
const list = ref([])
const loading = ref(false)
const saving = ref(false)
const formRef = ref()

const emptyForm = () => ({ id: '', title: '', type: '活动通知', content: '', scenic: ['平遥古城'], channels: { tourist: ['banner', 'message'], social: [] }, theme: 'blue', status: 'published' })
const editor = reactive({ visible: false, form: emptyForm() })

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  channels: [{
    validator: (_, v, cb) => {
      const f = editor.form
      f.channels.tourist.length || f.channels.social.length || f.scenic.length ? cb() : cb(new Error('请至少选择一个发布渠道'))
    }
  }]
}

async function load() {
  loading.value = true
  list.value = await listNotices(query)
  loading.value = false
}

function openEditor(n) {
  editor.form = n ? JSON.parse(JSON.stringify(n)) : emptyForm()
  editor.visible = true
}

async function submit(status) {
  await formRef.value.validate()
  saving.value = true
  await saveNotice({ ...editor.form, status })
  saving.value = false
  editor.visible = false
  ElMessage.success(status === 'draft' ? '已保存为草稿' : '公告已发布，正在推送至所选渠道')
  load()
}

async function publish(n) {
  await saveNotice({ ...n, status: 'published' })
  ElMessage.success('公告已发布')
  load()
}

async function remove(n) {
  await deleteNotice(n.id)
  ElMessage.success('已删除')
  load()
}

const channelLabels = n => [...n.channels.tourist, ...n.channels.social].map(c => CHANNEL_NAME[c])
const typeTag = t => ({ 安全预警: 'danger', 天气提醒: 'warning', 开放调整: 'primary', 活动通知: 'success', 交通提示: 'info' }[t] || 'primary')

onMounted(load)
</script>

<style scoped>
.panel {
  background: #fffdf8;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 20px 24px;
  box-shadow: 0 1px 2px rgba(80, 60, 30, 0.04), 0 4px 14px rgba(80, 60, 30, 0.04);
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.panel-head h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-family: var(--font-title);
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 2px;
  color: var(--mo);
}
.panel-head h3::before {
  content: '';
  width: 4px;
  height: 18px;
  border-radius: 1px;
  background: linear-gradient(180deg, var(--zhu), var(--zhu-deep));
}
.desc {
  margin: 0;
  color: #8f857b;
  font-size: 13px;
}
.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 18px 0 8px;
}
.count {
  margin-left: auto;
  color: #8f857b;
  font-size: 13px;
}
.list {
  min-height: 200px;
}
.item {
  display: flex;
  gap: 20px;
  padding: 16px 12px;
  margin: 0 -12px;
  border-bottom: 1px dashed #e6dccb;
  border-radius: 4px;
  transition: background 0.15s;
}
.item:hover {
  background: #fbf6ec;
}
.item-main {
  flex: 1;
  min-width: 0;
}
.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.item-title .t {
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #2a2522;
  font-size: 15px;
}
.item-content {
  margin: 8px 0;
  color: #5c534c;
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ch {
  margin-right: 6px;
}
.item-side {
  width: 200px;
  text-align: right;
  font-size: 12px;
  color: #8f857b;
}
.ops {
  margin-bottom: 8px;
}
.views {
  margin-top: 4px;
}
/* ---------- 编辑 ---------- */
.editor {
  display: flex;
  gap: 24px;
}
.editor-form {
  flex: 1;
}
.channels :deep(.el-form-item__content) {
  display: block;
}
.ch-group {
  border: 1px solid var(--line);
  background: #fcf9f3;
  border-radius: 4px;
  padding: 6px 12px;
  margin-bottom: 8px;
}
.ch-group .sub {
  padding-left: 24px;
}
.preview {
  width: 300px;
  flex-shrink: 0;
}
.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #5c534c;
  margin-bottom: 10px;
}
.themes {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.swatch {
  width: 34px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: #fff;
  border: 2px solid transparent;
}
.swatch.on {
  border-color: var(--zhu);
}
.swatch.blue { background: linear-gradient(135deg, #2b3a4a, #4f6780); }
.swatch.gold { background: linear-gradient(135deg, #d9a33a, #f3cf6a); }
.swatch.beige { background: linear-gradient(135deg, #e8dcc2, #f6efe0); }
.phone {
  border-radius: 22px;
  overflow: hidden;
  border: 6px solid #1f2533;
  height: 440px;
  display: flex;
  flex-direction: column;
  background: #f4f1ea;
}
.phone-bar {
  text-align: center;
  padding: 10px 0;
  font-family: var(--font-title);
  font-size: 15px;
  letter-spacing: 3px;
  color: #fff;
}
.phone.blue .phone-bar { background: #2b3a4a; }
.phone.gold .phone-bar { background: #c8872a; }
.phone.beige .phone-bar { background: #a88b5a; }
.phone-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}
.phone.blue .phone-body { background: linear-gradient(180deg, #e9edf1, #f6f7f9); }
.phone.gold .phone-body { background: linear-gradient(180deg, #7a6a55, #a8906a); }
.phone.beige .phone-body { background: linear-gradient(180deg, #f5ecd9, #fbf7ee); }
.banner {
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  color: #fff;
  background: linear-gradient(135deg, rgba(43, 58, 74, 0.95), rgba(79, 103, 128, 0.92));
}
.phone.gold .banner { background: linear-gradient(135deg, rgba(90, 70, 50, 0.9), rgba(140, 110, 70, 0.9)); }
.phone.beige .banner { background: linear-gradient(135deg, #b89461, #d4b27c); }
.badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #c9892f;
}
.b-title {
  font-weight: 700;
  margin: 6px 0 4px;
  font-size: 14px;
}
.b-text,
.m-text {
  font-size: 11px;
  line-height: 1.5;
  opacity: 0.92;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.msg {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
  color: #333;
}
.msg-ico {
  color: #c9892f;
  margin-top: 2px;
}
.m-title {
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 2px;
}
.scope {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 11px;
  color: #555;
}
.scope-t {
  margin-bottom: 4px;
}
.scope-tag {
  display: inline-block;
  padding: 1px 6px;
  margin: 2px 4px 2px 0;
  border-radius: 3px;
  background: #e1f3d8;
  color: #3f8b2a;
}
.none {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 40px;
}
.phone-foot {
  height: 40px;
  background: linear-gradient(180deg, #8b1d1d, #5a1010);
}
.preview-tip {
  text-align: center;
  font-size: 12px;
  color: #8f857b;
  margin: 8px 0 0;
}
</style>
