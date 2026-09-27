/**
 * 景区端数据接口层
 * ------------------------------------------------------------
 * USE_MOCK = true ：读写本地演示数据库（mockDb.js），无需后端即可完整演示。
 * USE_MOCK = false：请求后端 Spring Boot 接口（路径已按 REST 风格预留，见每个函数注释）。
 * 页面只调用这里导出的函数，切换后端时不需要改页面。
 */
import axios from 'axios'
import { db, save, resetDb, fmt, nextOrderCode, STAGES } from './mockDb'
import { analyzeFeedback } from '@/utils/nlp'

export const USE_MOCK = true

const http = axios.create({ baseURL: '/api/scenic', timeout: 10000 })
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('scenic-token')
  if (token) cfg.headers.Authorization = 'Bearer ' + token
  return cfg
})
const unwrap = p => p.then(r => r.data?.data ?? r.data)

const delay = (data, ms = 150) => new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), ms))
const now = () => fmt(Date.now())

/* ===================== 登录 / 注册 ===================== */

/** POST /auth/login */
export function login({ username, password }) {
  if (!USE_MOCK) return unwrap(http.post('/auth/login', { username, password }))
  const user = db().users.find(u => u.username === username && u.password === password)
  if (!user) return Promise.reject(new Error('用户名或密码错误'))
  const { password: _, ...info } = user
  return delay({ token: 'mock-' + Date.now(), user: info })
}

/** POST /auth/register */
export function register({ username, password, nickname, scenic }) {
  if (!USE_MOCK) return unwrap(http.post('/auth/register', { username, password, nickname, scenic }))
  const d = db()
  if (d.users.some(u => u.username === username)) return Promise.reject(new Error('该用户名已被注册'))
  d.users.push({ username, password, nickname: nickname || username, role: '工作人员', scenic })
  save()
  return delay(true)
}

/* ===================== 公告 ===================== */

/** GET /notices?keyword=&type=&status= */
export function listNotices(query = {}) {
  if (!USE_MOCK) return unwrap(http.get('/notices', { params: query }))
  let list = db().notices
  const { keyword, type, status } = query
  if (keyword) list = list.filter(n => n.title.includes(keyword) || n.content.includes(keyword))
  if (type) list = list.filter(n => n.type === type)
  if (status) list = list.filter(n => n.status === status)
  return delay([...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
}

/** POST /notices  或  PUT /notices/{id} */
export function saveNotice(notice) {
  if (!USE_MOCK) {
    return notice.id ? unwrap(http.put('/notices/' + notice.id, notice)) : unwrap(http.post('/notices', notice))
  }
  const d = db()
  if (notice.id) {
    const idx = d.notices.findIndex(n => n.id === notice.id)
    d.notices[idx] = { ...d.notices[idx], ...notice, updatedAt: now() }
  } else {
    const maxId = d.notices.reduce((m, n) => Math.max(m, Number(n.id.slice(1))), 1000)
    d.notices.push({ ...notice, id: 'N' + (maxId + 1), views: 0, author: currentUserName(), createdAt: now(), updatedAt: now() })
  }
  save()
  return delay(true)
}

/** DELETE /notices/{id} */
export function deleteNotice(id) {
  if (!USE_MOCK) return unwrap(http.delete('/notices/' + id))
  const d = db()
  d.notices = d.notices.filter(n => n.id !== id)
  save()
  return delay(true)
}

/* ===================== 反馈 ===================== */

/** GET /feedbacks?source=&type=&status=&sentiment=&keyword= */
export function listFeedbacks(query = {}) {
  if (!USE_MOCK) return unwrap(http.get('/feedbacks', { params: query }))
  let list = db().feedbacks
  const { source, type, status, sentiment, keyword, scenic } = query
  if (source) list = list.filter(f => f.source === source)
  if (type) list = list.filter(f => f.type === type)
  if (status) list = list.filter(f => f.status === status)
  if (scenic) list = list.filter(f => f.scenic === scenic)
  if (sentiment) list = list.filter(f => f.analysis.sentiment === sentiment)
  if (keyword) list = list.filter(f => f.content.includes(keyword) || f.location.includes(keyword))
  return delay(list)
}

export function getFeedback(id) {
  if (!USE_MOCK) return unwrap(http.get('/feedbacks/' + id))
  return delay(db().feedbacks.find(f => f.id === id) || null)
}

/** POST /feedbacks —— 游客端/商户端提交反馈（这里用于演示「模拟接收一条反馈」） */
export function createFeedback(fb) {
  if (!USE_MOCK) return unwrap(http.post('/feedbacks', fb))
  const d = db()
  const same = d.feedbacks.filter(f => f.type === fb.type && f.scenic === fb.scenic).length + 1
  const maxId = d.feedbacks.reduce((m, f) => Math.max(m, Number(f.id.slice(1))), 2000)
  const item = { images: [], contact: '', ...fb, id: 'F' + (maxId + 1), createdAt: now(), status: '待处理', workorderId: '' }
  item.analysis = analyzeFeedback(item, same)
  d.feedbacks.unshift(item)
  save()
  return delay(item)
}

/** PUT /feedbacks/{id}/status */
export function updateFeedbackStatus(id, status) {
  if (!USE_MOCK) return unwrap(http.put(`/feedbacks/${id}/status`, { status }))
  const f = db().feedbacks.find(x => x.id === id)
  if (f) f.status = status
  save()
  return delay(true)
}

/* ===================== 工作人员 ===================== */

/** GET /staff —— 附带当前在办工单数（用于派单负载均衡） */
export function listStaff() {
  if (!USE_MOCK) return unwrap(http.get('/staff'))
  const d = db()
  return delay(d.staff.map(s => {
    const mine = d.workorders.filter(o => o.assignee === s.id)
    const active = mine.filter(o => !o.stages[4].done).length
    const doneList = mine.filter(o => o.stages[4].done)
    const sat = doneList.filter(o => o.satisfaction)
    return {
      ...s,
      active,
      finished: doneList.length,
      avgSatisfaction: sat.length ? Number((sat.reduce((a, o) => a + o.satisfaction, 0) / sat.length).toFixed(1)) : null
    }
  }))
}

/* ===================== 工单 ===================== */

/** GET /workorders?status=&type=&keyword=&assignee= */
export function listWorkorders(query = {}) {
  if (!USE_MOCK) return unwrap(http.get('/workorders', { params: query }))
  let list = db().workorders
  const { stage, type, keyword, assignee, scenic } = query
  if (stage) list = list.filter(o => currentStage(o).key === stage)
  if (type) list = list.filter(o => o.type === type)
  if (assignee) list = list.filter(o => o.assignee === assignee)
  if (scenic) list = list.filter(o => o.scenic === scenic)
  if (keyword) list = list.filter(o => o.id.includes(keyword) || o.title.includes(keyword) || o.description.includes(keyword))
  return delay(list)
}

export function getWorkorder(id) {
  if (!USE_MOCK) return unwrap(http.get('/workorders/' + id))
  return delay(db().workorders.find(o => o.id === id) || null)
}

/** POST /workorders —— 创建并分派 */
export function createWorkorder(form) {
  if (!USE_MOCK) return unwrap(http.post('/workorders', form))
  const d = db()
  const id = nextOrderCode()
  const createdAt = now()
  const order = {
    id,
    title: form.title,
    type: form.type,
    priority: form.priority,
    scenic: form.scenic,
    location: form.location,
    description: form.description,
    source: form.source || '工作人员',
    feedbackId: form.feedbackId || '',
    assignee: form.assignee,
    assistants: form.assistants || [],
    deadline: form.deadline,
    createdAt,
    risk: form.risk ?? null,
    damage: form.damage || null,
    remark: form.remark || '',
    notifyTourist: !!form.notifyTourist,
    images: form.images || [],
    stages: STAGES.map(s => ({ key: s.key, name: s.name, done: false, time: '', operator: '', desc: '', images: [] })),
    satisfaction: null,
    finishedAt: ''
  }
  d.workorders.unshift(order)
  if (form.feedbackId) {
    const fb = d.feedbacks.find(f => f.id === form.feedbackId)
    if (fb) { fb.status = '已派单'; fb.workorderId = id }
  }
  save()
  return delay(order)
}

/** PUT /workorders/{id}/stages/{key} —— 确认一个流程节点 */
export function confirmStage(id, key, { desc, images = [], operator, satisfaction }) {
  if (!USE_MOCK) return unwrap(http.put(`/workorders/${id}/stages/${key}`, { desc, images, operator, satisfaction }))
  const d = db()
  const order = d.workorders.find(o => o.id === id)
  if (!order) return Promise.reject(new Error('工单不存在'))
  const idx = order.stages.findIndex(s => s.key === key)
  if (idx > 0 && !order.stages[idx - 1].done) return Promise.reject(new Error('请先完成上一节点'))
  Object.assign(order.stages[idx], { done: true, time: now(), operator: operator || currentUserName(), desc, images })
  if (key === 'done') {
    order.finishedAt = order.stages[idx].time
    order.satisfaction = satisfaction ?? order.satisfaction ?? 5
    const fb = d.feedbacks.find(f => f.id === order.feedbackId)
    if (fb) fb.status = '已完成'
  }
  save()
  return delay(order)
}

/** PUT /workorders/{id}/reject —— 验收不通过，退回「修复」环节并留痕 */
export function rejectAcceptance(id, { reason, operator }) {
  if (!USE_MOCK) return unwrap(http.put(`/workorders/${id}/reject`, { reason, operator }))
  const order = db().workorders.find(o => o.id === id)
  if (!order) return Promise.reject(new Error('工单不存在'))
  const repair = order.stages.find(s => s.key === 'repair')
  const feedback = order.stages.find(s => s.key === 'feedback')
  order.rejectLog = [...(order.rejectLog || []), { time: now(), reason, operator: operator || currentUserName() }]
  Object.assign(repair, { done: false, time: '', desc: `【验收退回】${reason}（原记录：${repair.desc}）` })
  Object.assign(feedback, { done: false, time: '', desc: '', images: [] })
  save()
  return delay(order)
}

/** 当前所处节点：第一个未完成节点；全部完成时返回「完成」 */
export function currentStage(order) {
  return order.stages.find(s => !s.done) || { ...order.stages[4], key: 'finished', name: '已完成' }
}

export function resetDemoData() {
  resetDb()
  return delay(true)
}

function currentUserName() {
  try {
    return JSON.parse(localStorage.getItem('scenic-user') || '{}').nickname || '景区管理员'
  } catch (e) {
    return '景区管理员'
  }
}
