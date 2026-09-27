# 山西智慧旅游大数据中心（景区端 Web）

对应《应游晋游·筑兴三乡》策划书「四、产品设计方案 → web端模块（景区端）」，图 4-23 ~ 4-30。

## 运行

```bash
npm install
npm run dev        # 开发模式，默认 http://localhost:5173
npm run build      # 打包到 dist/
```

演示账号：`admin / 123456`（登录页也可以注册新账号）。

## 页面与策划书对应关系

| 页面 | 路由 | 策划书 |
|---|---|---|
| 注册登录 | `#/login` | 图 4-24 |
| 发布公告（列表 + 编辑 + 游客端预览） | `#/notice` | 图 4-25 |
| 接收反馈（三方反馈、BERT 情感、关键词、问题 Top5、满意度趋势） | `#/feedback` | 图 4-26 |
| 安全预警（风险指数模型、共性问题聚类、预警等级、一键派单、发布预警公告） | `#/warning` | 图 4-26 |
| 工单创建与分派（问题确认 → 工单详情 → 分派设置 → 确认提交） | `#/workorder/create` | 图 4-27 |
| 工单流程追踪（接收 → 修复 → 反馈 → 验收 → 完成，上传图片、验收退回） | `#/workorder/track` | 图 4-28 |
| 工单统计与分析（处置效率、人员工作量、满意度趋势、YOLO11 六类损伤、损伤点位 TOP10） | `#/workorder/stats` | 图 4-29 |
| 数据大屏：综合分析 / 舆情分析 / 用户管理 | `#/screen` | 图 4-30 |

## 数据说明

- 后端（Spring Boot + MySQL）尚未部署，`src/api/index.js` 里 `USE_MOCK = true`，数据保存在浏览器 localStorage（`src/api/mockDb.js` 生成演示数据）。刷新页面不会丢，右上角菜单「重置演示数据」可以恢复初始状态。
- 接真实后端时，把 `USE_MOCK` 改成 `false`，按各函数注释里的 REST 路径实现接口即可，页面代码不用动。
- 情感分析 / 风险指数（`src/utils/nlp.js`）和古建损伤识别（`src/utils/damage.js`）在前端用规则近似计算，输出字段与后端模型一致。部署了 YOLO11 检测服务后，在 `damage.js` 里填写 `DETECT_API` 即可切换。
- 大屏「用户管理」页的「跳转后台」按钮会打开商户后台，地址在 `.env` 的 `VITE_MERCHANT_ADMIN_URL` 里配置。
- 山西地图数据：`src/assets/shanxi.json`（阿里云 DataV 行政区划）。

## 私有配置

腾讯地图 Key 和后端地址不提交到仓库。复制 `.env.local.example` 为 `.env.local` 后填写：

```bash
VITE_TMAP_KEY=你的腾讯位置服务Key
VITE_API_BASE=http://你的后端地址/
```
