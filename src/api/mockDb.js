/**
 * 本地演示数据库（localStorage 持久化）
 * ------------------------------------------------------------
 * 景区端后端（Spring Boot + MySQL）尚未部署时，所有页面读写这里的数据，
 * 刷新页面数据不丢失；点击右上角「重置演示数据」可恢复初始状态。
 * 接入真实后端时只需修改 src/api/index.js，页面代码无需改动。
 */
import { analyzeFeedback } from '@/utils/nlp'
import { DAMAGE_CLASSES, inferDamage } from '@/utils/damage'

const DB_KEY = 'sxtour-scenic-db-v2'

export const SCENICS = ['平遥古城', '忻州古城', '太原古县城', '榆次老城', '绛州古城', '云冈石窟', '乔家大院', '晋祠', '皇城相府', '王家大院']

export const NOTICE_TYPES = ['开放调整', '活动通知', '安全预警', '交通提示', '天气提醒', '服务公告']

export const FEEDBACK_TYPES = ['设施故障', '安全事件', '古建损伤', '环境卫生', '服务质量', '交通停车', '其他']

export { DAMAGE_CLASSES }

export const STAGES = [
  { key: 'receive', name: '接收' },
  { key: 'repair', name: '修复' },
  { key: 'feedback', name: '反馈' },
  { key: 'accept', name: '验收' },
  { key: 'done', name: '完成' }
]

export const PRIORITIES = ['紧急', '高', '中', '低']

const LOCATIONS = {
  平遥古城: ['南门瓮城', '日升昌票号', '平遥县衙', '城隍庙', '古市楼', '协同庆钱庄', '清虚观', '平遥文庙', '北门城墙', '明清街'],
  忻州古城: ['秀容书院', '北城门', '古城北大街'],
  太原古县城: ['县衙', '文庙', '东城门'],
  榆次老城: ['榆次县衙', '城隍庙', '凤鸣书院'],
  绛州古城: ['绛州大堂', '龙兴寺塔'],
  云冈石窟: ['第5窟外廊', '第20窟露天大佛', '游客中心'],
  乔家大院: ['在中堂', '德兴堂', '东北院'],
  晋祠: ['圣母殿', '难老泉', '鱼沼飞梁'],
  皇城相府: ['河山楼', '御书楼'],
  王家大院: ['高家崖', '红门堡']
}

const STAFF = [
  { id: 'S01', name: '张建国', dept: '古建修缮部', skills: ['古建损伤', '安全事件'], phone: '139****2101' },
  { id: 'S02', name: '李文涛', dept: '古建修缮部', skills: ['古建损伤'], phone: '138****5132' },
  { id: 'S03', name: '王晓燕', dept: '设施运维部', skills: ['设施故障', '交通停车'], phone: '137****8843' },
  { id: 'S04', name: '赵磊', dept: '设施运维部', skills: ['设施故障', '安全事件'], phone: '136****0921' },
  { id: 'S05', name: '刘芳', dept: '环境保洁部', skills: ['环境卫生'], phone: '135****6617' },
  { id: 'S06', name: '陈志强', dept: '安全保卫部', skills: ['安全事件', '交通停车'], phone: '159****3378' },
  { id: 'S07', name: '周婷', dept: '游客服务部', skills: ['服务质量', '其他'], phone: '158****4402' },
  { id: 'S08', name: '孙浩', dept: '安全保卫部', skills: ['安全事件', '设施故障'], phone: '188****7765' }
]

/** 带种子的伪随机，保证每次初始化的演示数据一致 */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const pad = n => String(n).padStart(2, '0')
export function fmt(d) {
  const t = new Date(d)
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}`
}

const FEEDBACK_SEEDS = [
  ['游客', '古建损伤', '平遥古城', '南门瓮城', '南门城墙外侧砖块开裂，有几块已经松动了，感觉有点危险，建议尽快修一下。'],
  ['游客', '服务质量', '平遥古城', '明清街', '平遥古城的夜景太美了！建议增加更多传统文化体验项目，会再来！'],
  ['游客', '设施故障', '平遥古城', '古市楼', '古市楼附近的路灯坏了好几个，晚上走路很不方便。'],
  ['商户', '交通停车', '平遥古城', '北门城墙', '北门停车场节假日太拥挤，游客排队进场要半小时，影响店里生意。'],
  ['工作人员', '古建损伤', '平遥古城', '日升昌票号', '日升昌票号后院木柱底部出现木裂缝，并有发霉迹象，需要古建部评估。'],
  ['游客', '环境卫生', '平遥古城', '城隍庙', '城隍庙旁边的垃圾桶满了没人清理，有点臭。'],
  ['游客', '服务质量', '平遥古城', '平遥县衙', '县衙的讲解员非常专业，升堂表演很有趣，孩子特别喜欢。'],
  ['游客', '其他', '平遥古城', '明清街', '指示牌太少了，找卫生间很难找，建议完善指示牌。'],
  ['游客', '安全事件', '平遥古城', '南门瓮城', '南门台阶有一块石板松动，我妈妈差点摔倒，存在安全隐患。'],
  ['商户', '服务质量', '平遥古城', '协同庆钱庄', '希望景区多组织非遗市集活动，淡季客流太少了。'],
  ['游客', '古建损伤', '平遥古城', '清虚观', '清虚观山门墙面剥落比较严重，拍照的时候看得很明显。'],
  ['工作人员', '设施故障', '平遥古城', '平遥文庙', '文庙东侧配电箱门锁坏了，电线外露，有漏电隐患。'],
  ['游客', '交通停车', '晋祠', '难老泉', '晋祠接驳车班次太少，等了40分钟，希望增加班次。'],
  ['游客', '服务质量', '云冈石窟', '游客中心', '云冈石窟太震撼了，数字展厅做得很好，值得推荐。'],
  ['游客', '古建损伤', '乔家大院', '在中堂', '在中堂门楼的砖雕有砖裂缝，建议加装防护栏避免游客触摸。'],
  ['商户', '其他', '榆次老城', '城隍庙', '希望平台能把我们店的非遗文创推到小程序首页。'],
  ['游客', '环境卫生', '忻州古城', '古城北大街', '北大街小吃街地面油污很多，下雨天很滑。'],
  ['游客', '设施故障', '皇城相府', '河山楼', '河山楼楼梯扶手松动，老人上楼有点危险。'],
  ['工作人员', '古建损伤', '平遥古城', '北门城墙', '北门城墙马道出现混凝土裂缝，局部可见裸露钢筋。'],
  ['游客', '服务质量', '平遥古城', '日升昌票号', '门票价格有点贵，但是讲解很值得，整体比较满意。'],
  ['游客', '交通停车', '平遥古城', '南门瓮城', '南门入口排队太久了，建议增加检票口，节假日非常拥挤。'],
  ['游客', '其他', '王家大院', '红门堡', '希望增加摄影区域开放，很多院子不让进去拍照。'],
  ['商户', '环境卫生', '平遥古城', '明清街', '店门口的下水道堵了，一下雨就积水。'],
  ['游客', '古建损伤', '绛州古城', '龙兴寺塔', '龙兴寺塔基座有发霉和剥落现象。'],
  ['工作人员', '安全事件', '云冈石窟', '第20窟露天大佛', '大佛前广场客流高峰时段过于拥挤，存在踩踏风险，建议限流。'],
  ['游客', '服务质量', '晋祠', '圣母殿', '圣母殿的宋代彩塑太美了，希望增加历史讲解服务。'],
  ['游客', '设施故障', '太原古县城', '东城门', '东城门的自助售票机故障，只能人工排队。'],
  ['游客', '环境卫生', '平遥古城', '古市楼', '公共厕所很干净，工作人员态度也很热情，点赞。']
]

const NOTICE_SEEDS = [
  { title: '忻州古城开放时间有变！', type: '开放调整', content: '尊敬的游客您好，新春来临之际，忻州全体员工为您送上真心的祝福！春节期间（2月9日—2月17日）古城开放时间延长至22:00。', scenic: ['忻州古城'], theme: 'gold' },
  { title: '平遥古城夜间开放调整', type: '开放调整', content: '平遥古城夜游项目开放时间调整为19:00-22:00，灯光秀表演时间调整为20:00、21:00各一场。', scenic: ['平遥古城'], theme: 'blue' },
  { title: '国庆假期客流预警', type: '安全预警', content: '国庆期间预计单日客流超8万人次，南门、北门入口将实行分时段限流，请游客提前在小程序预约入城时段。', scenic: ['平遥古城', '榆次老城'], theme: 'blue' },
  { title: '"晋商年俗"非遗市集开市', type: '活动通知', content: '10月1日至7日，明清街将举办推光漆器、平遥牛肉、剪纸等非遗市集，完成小程序打卡任务可领取文创优惠券。', scenic: ['平遥古城'], theme: 'gold' },
  { title: '晋祠接驳车加密班次', type: '交通提示', content: '自即日起，晋祠景区接驳车周末班次加密至每15分钟一班，首班8:00，末班18:00。', scenic: ['晋祠'], theme: 'beige' },
  { title: '雷阵雨天气提醒', type: '天气提醒', content: '今日午后有雷阵雨，城墙、马道等高处区域将临时关闭，请游客注意防雷避雨，留意现场工作人员指引。', scenic: ['平遥古城', '忻州古城', '太原古县城'], theme: 'blue' },
  { title: '南门城墙局部封闭修缮', type: '安全预警', content: '南门瓮城外侧城墙因砖体开裂进行抢修，施工期间该区域临时封闭，请游客绕行北门马道，给您带来不便敬请谅解。', scenic: ['平遥古城'], theme: 'blue' },
  { title: '云冈石窟数字展厅上新', type: '服务公告', content: '第5窟、第6窟数字化复原展即日起在游客中心开放，持景区门票可免费参观。', scenic: ['云冈石窟'], theme: 'beige' }
]

function buildSeed() {
  const rand = rng(20260927)
  const pick = arr => arr[Math.floor(rand() * arr.length)]
  const now = Date.now()
  const DAY = 86400000

  // ---- 公告 ----
  const notices = NOTICE_SEEDS.map((n, i) => {
    const created = now - (i * 3 + 1) * DAY - Math.floor(rand() * DAY / 2)
    return {
      id: 'N' + String(1001 + i),
      ...n,
      channels: {
        tourist: i % 3 === 2 ? ['message'] : ['banner', 'message'],
        social: i % 2 === 0 ? ['wechat'] : ['wechat', 'douyin']
      },
      status: i === NOTICE_SEEDS.length - 1 ? 'draft' : 'published',
      author: '景区管理员',
      views: Math.floor(800 + rand() * 12000),
      createdAt: fmt(created),
      updatedAt: fmt(created + DAY / 3)
    }
  })

  // ---- 反馈 ----
  const topicCount = {}
  FEEDBACK_SEEDS.forEach(f => { topicCount[f[1] + f[2]] = (topicCount[f[1] + f[2]] || 0) + 1 })
  const names = { 游客: ['晋游小鹿', '古城漫步者', 'Tony', '周末去哪儿', '山西老乡', '研学团王老师', '摄影师阿杰', '亲子游妈妈'], 商户: ['协同庆食铺', '推光漆器坊', '冠云牛肉店', '古韵民宿'], 工作人员: ['巡检员-刘', '巡检员-马', '安保-陈'] }
  const feedbacks = FEEDBACK_SEEDS.map((f, i) => {
    const [source, type, scenic, location, content] = f
    const created = now - Math.floor(rand() * 28 * DAY) - 3600000
    const fb = {
      id: 'F' + String(2001 + i),
      source, type, scenic, location, content,
      name: pick(names[source]),
      contact: source === '游客' ? '微信小程序用户' : '',
      images: [],
      createdAt: fmt(created),
      status: '待处理',
      workorderId: ''
    }
    fb.analysis = analyzeFeedback(fb, topicCount[type + scenic])
    return fb
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // ---- 工单（历史数据，用于统计分析） ----
  const workorders = []
  let seq = 1
  const mkCode = t => {
    const d = new Date(t)
    return `GD${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${String(seq++).padStart(3, '0')}`
  }
  const HANDLE_HOURS = { 设施故障: 10, 安全事件: 5, 古建损伤: 60, 环境卫生: 3, 服务质量: 8, 交通停车: 12, 其他: 16 }

  // 部分反馈已派单
  feedbacks.forEach((fb, i) => {
    if (fb.analysis.sentiment === 'positive' && fb.type === '服务质量') {
      if (i % 2 === 0) fb.status = '已忽略'
      return
    }
    if (i % 3 === 0) return // 保留一部分待处理，供演示派单
    const staff = STAFF.find(s => s.skills.includes(fb.type)) || STAFF[6]
    const created = new Date(fb.createdAt.replace(/-/g, '/')).getTime() + 1800000
    const stageCount = 1 + Math.floor(rand() * 5)
    workorders.push(makeOrder({ fb, staff, created, stageCount }))
  })

  // 额外历史工单（近 60 天）
  for (let k = 0; k < 46; k++) {
    const type = pick(['古建损伤', '古建损伤', '设施故障', '设施故障', '环境卫生', '安全事件', '服务质量', '交通停车', '其他'])
    const scenic = rand() < 0.55 ? '平遥古城' : pick(SCENICS)
    const location = pick(LOCATIONS[scenic])
    const staff = pick(STAFF.filter(s => s.skills.includes(type)).concat(STAFF[6]))
    const created = now - Math.floor((4 + rand() * 56) * DAY)
    const fb = {
      id: '', source: pick(['游客', '游客', '工作人员', '商户']), type, scenic, location,
      content: type === '古建损伤' ? `${location}巡检发现${pick(DAMAGE_CLASSES)}，需要评估修复。` : `${location}${pick(['设施报修', '卫生问题', '游客投诉', '安全巡查发现问题', '停车秩序问题'])}`
    }
    workorders.push(makeOrder({ fb, staff, created, stageCount: 5 }))
  }

  function makeOrder({ fb, staff, created, stageCount }) {
    const hours = HANDLE_HOURS[fb.type] * (0.5 + rand())
    const stepMs = (hours * 3600000) / 4
    const stages = STAGES.map((s, idx) => {
      const done = idx < stageCount
      return {
        key: s.key,
        name: s.name,
        done,
        time: done ? fmt(created + idx * stepMs) : '',
        operator: done ? (idx === 3 ? '景区管理员' : staff.name) : '',
        desc: done ? stageDesc(s.key, fb) : '',
        images: []
      }
    })
    const risk = fb.analysis ? fb.analysis.risk : Math.floor(20 + rand() * 60)
    const order = {
      id: mkCode(created),
      title: `${fb.scenic}·${fb.location}${fb.type}`,
      type: fb.type,
      priority: risk >= 75 ? '紧急' : risk >= 55 ? '高' : risk >= 35 ? '中' : '低',
      scenic: fb.scenic,
      location: fb.location,
      description: fb.content,
      source: fb.source,
      feedbackId: fb.id,
      assignee: staff.id,
      assistants: [],
      deadline: fmt(created + Math.max(4, HANDLE_HOURS[fb.type] * 1.5) * 3600000),
      createdAt: fmt(created),
      risk,
      damage: fb.type === '古建损伤'
        ? { cls: inferDamage(fb.content).cls, confidence: Number((0.78 + rand() * 0.19).toFixed(2)) }
        : null,
      stages,
      satisfaction: stageCount === 5 ? Math.min(5, Math.max(2, Math.round(3.4 + rand() * 1.8))) : null,
      finishedAt: stageCount === 5 ? stages[4].time : ''
    }
    if (fb.id) {
      fb.status = stageCount === 5 ? '已完成' : '已派单'
      fb.workorderId = order.id
    }
    return order
  }

  function stageDesc(key, fb) {
    return {
      receive: '已接单，前往现场核查',
      repair: fb.type === '古建损伤' ? '按古建修缮规范完成加固/修补，保留原有形制' : '现场处置完成',
      feedback: '已上传修复前后对比照片，并通过小程序推送给反馈人',
      accept: '现场验收合格',
      done: '工单关闭，归档'
    }[key]
  }

  workorders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const users = [{ username: 'admin', password: '123456', nickname: '景区管理员', role: '管理员', scenic: '平遥古城' }]

  return { version: 1, notices, feedbacks, workorders, staff: STAFF, users, seq }
}

let cache = null

export function db() {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) cache = JSON.parse(raw)
  } catch (e) {
    cache = null
  }
  if (!cache || cache.version !== 1) {
    cache = buildSeed()
    save()
  }
  return cache
}

export function save() {
  localStorage.setItem(DB_KEY, JSON.stringify(cache))
}

export function resetDb() {
  cache = buildSeed()
  save()
  return cache
}

export function nextOrderCode() {
  const d = db()
  const t = new Date()
  const prefix = `GD${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}`
  const ids = new Set(d.workorders.map(o => o.id))
  let n = d.workorders.filter(o => o.id.startsWith(prefix)).length + 1
  while (ids.has(prefix + String(n).padStart(3, '0'))) n++
  return prefix + String(n).padStart(3, '0')
}
