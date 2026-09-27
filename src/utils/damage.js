/**
 * 古城建筑损伤识别
 * ------------------------------------------------------------
 * 线上方案：游客在小程序上传照片 → 改进 YOLO11 模型（mAP50 较基线 +4.4%）识别 6 类损伤。
 * 模型服务未部署时，这里根据反馈文字推断损伤类别，给出与模型输出相同结构的结果，
 * 部署后把 DETECT_API 改成检测服务地址即可（POST 图片，返回 {cls, confidence, boxes}）。
 */
/** 改进 YOLO11 模型可识别的 6 类古建损伤 */
export const DAMAGE_CLASSES = ['裸露钢筋', '剥落', '混凝土裂缝', '木裂缝', '发霉', '砖裂缝']

export const DETECT_API = '' // 例如 'http://127.0.0.1:5000/detect'

const RULES = [
  ['裸露钢筋', ['钢筋']],
  ['发霉', ['霉', '青苔', '潮湿']],
  ['木裂缝', ['木柱', '木梁', '木裂', '门板', '木构']],
  ['混凝土裂缝', ['混凝土', '水泥', '马道']],
  ['砖裂缝', ['砖', '城墙', '墙体', '砖雕']],
  ['剥落', ['剥落', '脱落', '掉皮', '起皮', '墙面']]
]

export async function detectDamage({ text = '', image = null } = {}) {
  if (DETECT_API && image) {
    const blob = await (await fetch(image)).blob()
    const fd = new FormData()
    fd.append('file', blob, 'damage.jpg')
    const res = await fetch(DETECT_API, { method: 'POST', body: fd })
    return { ...(await res.json()), by: 'YOLO11' }
  }
  return { ...inferDamage(text), by: '文本推断（检测服务未连接）' }
}

/** 根据文字描述推断损伤类别（同步版本，也用于生成演示数据） */
export function inferDamage(text = '') {
  const direct = DAMAGE_CLASSES.find(c => text.includes(c))
  const rule = RULES.find(([, words]) => words.some(w => text.includes(w)))
  const cls = direct || (rule && rule[0]) || '剥落'
  // 置信度：文本命中越直接越高（仅用于演示）
  const confidence = direct ? 0.93 : rule ? 0.86 : 0.71
  return { cls, confidence }
}
