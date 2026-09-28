/**
 * 前端轻量文本分析（演示用）
 * ------------------------------------------------------------
 * 策划书中的线上方案：Transformer-BERT 情感分析 + 关键词抽取，由后端 Python 服务完成。
 * 未连接后端时，这里用「情感词典 + 否定词 + 程度副词」规则做近似计算，
 * 接口字段与后端保持一致（sentiment / score / keywords），便于后续无缝替换。
 */

const POSITIVE = ['好', '美', '棒', '满意', '喜欢', '推荐', '干净', '方便', '热情', '专业', '值得', '震撼', '有趣', '贴心', '快', '及时', '舒服', '赞', '惊喜', '再来']
const NEGATIVE = ['差', '脏', '乱', '慢', '贵', '坏', '破损', '开裂', '脱落', '堵', '拥挤', '排队', '失望', '不满', '投诉', '危险', '隐患', '故障', '漏水', '松动', '坍塌', '倒塌', '受伤', '摔', '宰客', '欺骗', '难找', '缺少', '没有', '不足', '混乱', '吵', '臭', '发霉', '裂缝']
const NEGATION = ['不', '没', '无', '别', '未']
const DEGREE = { 非常: 1.8, 特别: 1.8, 太: 1.6, 很: 1.4, 比较: 1.1, 有点: 0.8, 稍微: 0.7 }

/** 安全相关词：出现即提高风险权重 */
export const SAFETY_WORDS = ['危险', '隐患', '坍塌', '倒塌', '松动', '受伤', '摔', '漏电', '火', '裂缝', '开裂', '脱落', '拥挤', '踩踏', '落石', '故障']

/** 关键词候选词表（景区业务领域词） */
const DOMAIN_WORDS = [
  '指示牌', '厕所', '卫生间', '停车场', '停车', '排队', '门票', '讲解', '导览', '夜游', '灯光秀', '演出', '餐饮', '美食', '民宿', '住宿',
  '价格', '服务', '卫生', '垃圾桶', '台阶', '栏杆', '城墙', '古建', '屋檐', '瓦片', '木柱', '墙面', '路面', '井盖', '电线', '路灯',
  '客流', '拥挤', '交通', '接驳车', '文创', '非遗', '摄影', '拍照', '标识', '座椅', '饮水', '无障碍', '母婴室', '商户', '工作人员', '态度'
]

/**
 * 情感分析
 * @param {string} text
 * @returns {{sentiment: 'positive'|'neutral'|'negative', score: number}} score ∈ [-1, 1]
 */
export function analyzeSentiment(text = '') {
  let score = 0
  const scan = (words, sign) => {
    words.forEach(w => {
      let idx = text.indexOf(w)
      while (idx !== -1) {
        const before = text.slice(Math.max(0, idx - 3), idx)
        let weight = 1
        Object.entries(DEGREE).forEach(([d, v]) => { if (before.includes(d)) weight = v })
        const negated = NEGATION.some(n => before.endsWith(n) || before.endsWith(n + '太') || before.endsWith(n + '很'))
        score += (negated ? -sign : sign) * weight
        idx = text.indexOf(w, idx + w.length)
      }
    })
  }
  scan(POSITIVE, 1)
  scan(NEGATIVE, -1)
  const norm = Math.max(-1, Math.min(1, score / 4))
  const sentiment = norm > 0.15 ? 'positive' : norm < -0.15 ? 'negative' : 'neutral'
  return { sentiment, score: Number(norm.toFixed(2)) }
}

/**
 * 关键词抽取：领域词表匹配 + 词频排序
 * @returns {string[]}
 */
export function extractKeywords(text = '', topK = 4) {
  const hits = DOMAIN_WORDS
    .map(w => ({ w, n: text.split(w).length - 1 }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n || b.w.length - a.w.length)
    .map(x => x.w)
  return [...new Set(hits)].slice(0, topK)
}

/**
 * 风险指数模型（策划书：舆情热度 + 情绪占比 + 权重分配 + 线性回归/决策树）
 * 这里给出可解释的线性加权版本，结果 0-100：
 *   R = 35·负面强度 + 25·安全词命中 + 20·同类问题热度 + 20·类型权重
 * 再按阈值（决策树的叶子）划分预警等级。
 */
const TYPE_WEIGHT = { 安全事件: 1, 设施故障: 0.8, 古建损伤: 0.85, 环境卫生: 0.45, 服务质量: 0.4, 交通停车: 0.5, 其他: 0.3 }

export function calcRiskIndex({ text = '', type = '其他', score = 0, sameTopicCount = 1 }) {
  const negative = Math.max(0, -score)
  const safetyHits = SAFETY_WORDS.filter(w => text.includes(w)).length
  const safety = Math.min(1, safetyHits / 2)
  const heat = Math.min(1, Math.log2(1 + sameTopicCount) / 4)
  const typeW = TYPE_WEIGHT[type] ?? 0.3
  const r = 35 * negative + 25 * safety + 20 * heat + 20 * typeW
  return Math.round(Math.max(0, Math.min(100, r)))
}

/** 预警等级：与国家突发事件预警颜色（红/橙/黄/蓝）一致，色值调整为与国风主题协调的传统色 */
export function riskLevel(index) {
  if (index >= 75) return { level: 'Ⅰ级', color: '红色', tag: 'danger', hex: '#c2413a' }
  if (index >= 55) return { level: 'Ⅱ级', color: '橙色', tag: 'warning', hex: '#d97a34' }
  if (index >= 35) return { level: 'Ⅲ级', color: '黄色', tag: 'warning', hex: '#c9a227' }
  return { level: 'Ⅳ级', color: '蓝色', tag: 'info', hex: '#4a7aa8' }
}

/** 对一条反馈做完整分析 */
export function analyzeFeedback(fb, sameTopicCount = 1) {
  const { sentiment, score } = analyzeSentiment(fb.content)
  const keywords = extractKeywords(fb.content)
  const risk = calcRiskIndex({ text: fb.content, type: fb.type, score, sameTopicCount })
  return { sentiment, score, keywords, risk }
}
