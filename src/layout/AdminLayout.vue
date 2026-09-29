<template>
  <el-container class="layout admin-shell" :class="{ 'nav-open': navOpen }">
    <el-aside width="220px" class="aside">
      <div class="brand" @click="go('/')">
        <img class="seal-logo" :src="sealLogo" alt="应游晋游" width="44" height="44" />
        <div class="brand-text">
          <div class="name">应游晋游</div>
          <div class="sub">景区运营管理平台</div>
        </div>
      </div>
      <i class="huiwen-strip" aria-hidden="true"></i>

      <el-menu :default-active="route.path" router class="menu" :default-openeds="['ops', 'fb', 'wo']" @select="navOpen = false">
        <el-sub-menu index="ops">
          <template #title><el-icon><Notification /></el-icon><span>景区运营</span></template>
          <el-menu-item index="/notice">发布公告</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="fb">
          <template #title><el-icon><ChatLineRound /></el-icon><span>反馈与预警</span></template>
          <el-menu-item index="/feedback">
            接收反馈
            <span v-if="pendingCount" class="menu-badge">{{ pendingCount }}</span>
          </el-menu-item>
          <el-menu-item index="/warning">安全预警</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="wo">
          <template #title><el-icon><Tickets /></el-icon><span>工单管理</span></template>
          <el-menu-item index="/workorder/create">工单创建与分派</el-menu-item>
          <el-menu-item index="/workorder/track">工单流程追踪</el-menu-item>
          <el-menu-item index="/workorder/stats">工单统计与分析</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="screen-entry" @click="go('/screen')">
        <el-icon><DataAnalysis /></el-icon>
        <div>
          <div class="se-title">数据大屏</div>
          <div class="se-sub">综合 · 舆情 · 商户</div>
        </div>
        <el-icon class="se-arrow"><Right /></el-icon>
      </div>
    </el-aside>
    <div class="nav-mask" @click="navOpen = false"></div>

    <el-container class="body">
      <el-header class="header">
        <button class="nav-toggle" type="button" aria-label="展开菜单" @click="navOpen = !navOpen">
          <i></i><i></i><i></i>
        </button>
        <div class="crumb">
          <span class="crumb-group">{{ route.meta.group }}</span>
          <span class="crumb-sep">·</span>
          <h2>{{ route.meta.title }}</h2>
        </div>
        <div class="right">
          <span class="date">{{ today }}</span>
          <el-badge :value="pendingCount" :hidden="!pendingCount" class="bell">
            <el-icon :size="18" @click="router.push('/feedback')"><Bell /></el-icon>
          </el-badge>
          <el-dropdown @command="onCommand">
            <span class="user">
              <el-avatar :size="32" class="avatar">{{ (user.nickname || '管').slice(0, 1) }}</el-avatar>
              <span class="u-text">
                <b>{{ user.nickname || '景区管理员' }}</b>
                <small>{{ user.scenic || '平遥古城' }} · {{ user.role || '管理员' }}</small>
              </span>
              <el-icon class="u-arrow"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="reset" :icon="RefreshLeft">重置演示数据</el-dropdown-item>
                <el-dropdown-item command="logout" :icon="SwitchButton" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataAnalysis, Bell, ArrowDown, RefreshLeft, SwitchButton, Notification, ChatLineRound, Tickets, Right } from '@element-plus/icons-vue'
import { listFeedbacks, resetDemoData } from '@/api'
import sealLogo from '@/assets/guofeng/seal-logo.webp'

const route = useRoute()
const router = useRouter()
const user = JSON.parse(localStorage.getItem('scenic-user') || '{}')
const pendingCount = ref(0)
// 小屏下侧栏改为抽屉式，navOpen 控制展开（纯界面状态）
const navOpen = ref(false)
function go(path) {
  navOpen.value = false
  router.push(path)
}
const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

async function refreshPending() {
  pendingCount.value = (await listFeedbacks({ status: '待处理' })).length
}
watch(() => route.fullPath, refreshPending, { immediate: true })

async function onCommand(cmd) {
  if (cmd === 'logout') {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' })
    localStorage.removeItem('scenic-token')
    localStorage.removeItem('scenic-user')
    router.replace('/login')
  } else if (cmd === 'reset') {
    await ElMessageBox.confirm('将清空本地修改并恢复初始演示数据，是否继续？', '重置演示数据', { type: 'warning' })
    await resetDemoData()
    ElMessage.success('演示数据已重置')
    router.replace({ path: route.path, query: { t: Date.now() } })
  }
}
</script>


<style scoped>
.layout {
  height: 100vh;
}

/* ---------- 侧栏：黛青 + 鎏金 ---------- */
.aside {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(201, 164, 92, 0.16), transparent 60%),
    linear-gradient(180deg, #2b3a4a 0%, #223040 55%, #1c2733 100%);
  box-shadow: 2px 0 14px rgba(0, 0, 0, 0.14);
  z-index: 20;
}
.aside::before {
  /* 右缘金线 */
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, rgba(232, 207, 148, 0.5), rgba(232, 207, 148, 0.08) 40%, rgba(232, 207, 148, 0.08) 70%, rgba(232, 207, 148, 0.4));
  pointer-events: none;
}
.aside::after {
  /* 底部远山 + 祥云 */
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 190px;
  pointer-events: none;
  background:
    var(--cloud-light) right -18px top 18px / 120px 60px no-repeat,
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 140' preserveAspectRatio='none'%3E%3Cpath d='M0 90 L30 60 L55 78 L90 38 L120 70 L150 50 L185 80 L220 55 V140 H0Z' fill='%23c9a45c' opacity='.5'/%3E%3Cpath d='M0 115 L40 95 L70 108 L110 88 L150 104 L190 92 L220 100 V140 H0Z' fill='%23c9a45c' opacity='.35'/%3E%3C/svg%3E") left bottom / 100% 120px no-repeat;
  opacity: 0.22;
}
.brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 76px;
  padding: 0 18px;
  flex-shrink: 0;
  cursor: pointer;
}
.seal-logo {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  padding: 3px;
  background: rgba(255, 246, 230, 0.94);
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(232, 207, 148, 0.6), 0 3px 8px rgba(0, 0, 0, 0.3);
  transform: rotate(-3deg);
  transition: transform 0.35s ease;
}
.brand:hover .seal-logo {
  transform: rotate(0deg) scale(1.04);
}
.name {
  font-family: var(--font-brush);
  font-size: 24px;
  letter-spacing: 4px;
  line-height: 1.1;
  background: linear-gradient(180deg, #fbeccb 0%, #e8cf94 55%, #c9a45c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sub {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 3px;
  color: rgba(233, 223, 200, 0.55);
}
.huiwen-strip {
  display: block;
  flex-shrink: 0;
  height: 10px;
  margin: 0 14px;
  opacity: 0.45;
  background: var(--huiwen-light) left center / 16px 10px repeat-x;
}

.menu {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  border-right: none;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: rgba(201, 164, 92, 0.1);
  --el-menu-text-color: #c9d0d8;
  --el-menu-active-color: #fff;
  --el-menu-item-height: 44px;
  --el-menu-sub-item-height: 42px;
}
.menu :deep(.el-sub-menu__title) {
  color: rgba(232, 207, 148, 0.62);
  font-size: 13px;
  letter-spacing: 2px;
}
.menu :deep(.el-sub-menu__title:hover) {
  background: transparent;
  color: #e8cf94;
}
.menu :deep(.el-menu-item) {
  position: relative;
  margin: 2px 12px;
  padding-left: 40px !important;
  border-radius: 3px;
  font-size: 14px;
  letter-spacing: 1px;
  transition: background-color 0.2s ease, color 0.2s ease, padding-left 0.25s ease;
}
.menu :deep(.el-menu-item:not(.is-active):hover) {
  padding-left: 44px !important;
  color: #f3e3bd;
}
.menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #b83a2f, #9a3027);
  box-shadow: inset 0 0 0 1px rgba(240, 217, 162, 0.35), 0 4px 12px rgba(150, 44, 35, 0.4);
}
.menu :deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 18px;
  top: 50%;
  width: 6px;
  height: 6px;
  transform: translateY(-50%) rotate(45deg);
  background: #f0d9a2;
  box-shadow: 0 0 6px rgba(240, 217, 162, 0.8);
}
.menu-badge {
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  color: #fff;
  background: #c9483a;
  border-radius: 9px;
}
.menu :deep(.el-menu-item.is-active) .menu-badge {
  color: #962c23;
  background: #f6e2ae;
}

.screen-entry {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px;
  padding: 12px 14px;
  color: #f0d9a2;
  background:
    var(--corner-tl-light) left 3px top 3px / 12px 12px no-repeat,
    var(--corner-br-light) right 3px bottom 3px / 12px 12px no-repeat,
    linear-gradient(135deg, rgba(14, 26, 51, 0.95), rgba(28, 50, 100, 0.95));
  border: 1px solid rgba(201, 164, 92, 0.45);
  border-radius: 3px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.screen-entry:hover {
  transform: translateY(-2px);
  border-color: rgba(232, 207, 148, 0.8);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(232, 207, 148, 0.2);
}
.se-title {
  font-family: var(--font-title);
  font-size: 15px;
  letter-spacing: 2px;
}
.se-sub {
  font-size: 11px;
  color: rgba(233, 223, 200, 0.55);
}
.se-arrow {
  margin-left: auto;
  transition: transform 0.25s ease;
}
.screen-entry:hover .se-arrow {
  transform: translateX(3px);
}
.nav-mask {
  display: none;
}

/* ---------- 顶栏：宣纸 + 青绿山水 ---------- */
.body {
  min-width: 0;
  background: var(--xuan);
}
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  padding: 0 24px;
  background: linear-gradient(180deg, #fffdf8, #fbf6ec);
  z-index: 5;
}
.header::before {
  /* 青绿山水长卷，右侧淡入 */
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: url('@/assets/guofeng/banner-mountains.webp') right 12% top 58% / 1100px auto no-repeat;
  opacity: 0.42;
  -webkit-mask-image: linear-gradient(90deg, transparent 22%, rgba(0, 0, 0, 0.35) 45%, #000 80%);
  mask-image: linear-gradient(90deg, transparent 22%, rgba(0, 0, 0, 0.35) 45%, #000 80%);
}
.header::after {
  /* 底边：金线 + 回纹 */
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 7px;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(201, 164, 92, 0.75), rgba(201, 164, 92, 0.25) 60%, rgba(201, 164, 92, 0.6)) left top / 100% 1px no-repeat,
    var(--huiwen) left 3px / 16px 10px repeat-x;
  opacity: 0.55;
}
.header > * {
  position: relative;
}
.nav-toggle {
  display: none;
}
.crumb {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}
.crumb-group {
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--mo-3);
  white-space: nowrap;
}
.crumb-sep {
  color: var(--jin);
}
.crumb h2 {
  margin: 0;
  font-family: var(--font-title);
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 3px;
  color: var(--mo);
  white-space: nowrap;
}
.right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.date {
  padding: 3px 10px;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--mo-2);
  background: rgba(255, 253, 248, 0.75);
  border: 1px solid rgba(201, 164, 92, 0.35);
  border-radius: 2px;
}
.bell {
  display: flex;
  color: var(--mo-2);
  cursor: pointer;
  transition: color 0.2s ease;
}
.bell:hover {
  color: var(--zhu);
}
.user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 4px;
  color: var(--mo);
  cursor: pointer;
  outline: none;
  background: rgba(255, 253, 248, 0.75);
  border: 1px solid transparent;
  border-radius: 22px;
  transition: border-color 0.2s ease;
}
.user:hover {
  border-color: rgba(201, 164, 92, 0.45);
}
.u-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.u-text b {
  font-size: 14px;
  font-weight: 600;
}
.u-text small {
  font-size: 11px;
  color: var(--mo-3);
}
.avatar {
  font-family: var(--font-title);
  font-size: 16px;
  background: linear-gradient(135deg, #3a4d60, #1f2b37);
  color: #f0d9a2;
  box-shadow: 0 0 0 2px #fffdf8, 0 0 0 3px rgba(201, 164, 92, 0.6);
}

/* ---------- 内容：宣纸纹理 ---------- */
.main {
  position: relative;
  padding: 24px 24px 28px;
  overflow-y: auto;
  background:
    var(--tex-paper),
    radial-gradient(circle at 100% 0%, rgba(201, 164, 92, 0.1), transparent 420px),
    radial-gradient(circle at 0% 100%, rgba(63, 122, 95, 0.05), transparent 380px),
    var(--xuan);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
}

/* ---------- 小屏：侧栏改抽屉 ---------- */
@media (max-width: 992px) {
  .date {
    display: none;
  }
}
@media (max-width: 768px) {
  .aside {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .nav-open .aside {
    transform: none;
  }
  .nav-mask {
    position: fixed;
    inset: 0;
    z-index: 19;
    display: block;
    background: rgba(20, 16, 12, 0.45);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .nav-open .nav-mask {
    opacity: 1;
    pointer-events: auto;
  }
  .header {
    height: 56px;
    padding: 0 12px;
    gap: 10px;
  }
  .header::before {
    background-size: 700px auto;
    background-position: right 20% top 58%;
  }
  .nav-toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    width: 34px;
    height: 34px;
    padding: 0 8px;
    flex-shrink: 0;
    background: #fffdf8;
    border: 1px solid rgba(201, 164, 92, 0.5);
    border-radius: 3px;
    cursor: pointer;
  }
  .nav-toggle i {
    display: block;
    height: 2px;
    background: var(--dai);
    border-radius: 1px;
  }
  .nav-toggle i:nth-child(2) {
    width: 70%;
    background: var(--zhu);
  }
  .crumb {
    flex: 1;
  }
  .crumb-group,
  .crumb-sep,
  .u-text,
  .u-arrow {
    display: none;
  }
  .crumb h2 {
    font-size: 18px;
    letter-spacing: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .right {
    gap: 14px;
  }
  .user {
    padding: 2px;
  }
  .main {
    padding: 14px 12px 20px;
  }
}
</style>

<!-- 各业务页在小屏下的栅格收拢（页面自身样式是 scoped，这里用 .admin-shell 前缀提高优先级统一处理） -->
<style>
@media (max-width: 1200px) {
  .admin-shell .main .kpis { grid-template-columns: repeat(3, 1fr); }
  .admin-shell .main .charts { grid-template-columns: repeat(2, 1fr); }
  .admin-shell .main .stats { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .admin-shell .main :is(.stats, .kpis, .lv-grid) { grid-template-columns: repeat(2, 1fr); }
  .admin-shell .main :is(.charts, .grid.g2, .grid.g3, .top, .clusters, .track-page) { grid-template-columns: 1fr; }
  .admin-shell .main :is(.charts, .grid, .top, .clusters, .track-page) > * { min-width: 0; }
  .admin-shell .main :is(.stat, .kpi) { padding: 12px 12px 10px 16px; }
  .admin-shell .main :is(.stat-value, .k-value) { font-size: 24px; }
  .admin-shell .main :is(.panel-head, .filters, .toolbar, .item, .editor, .d-head) { flex-wrap: wrap; }
  .admin-shell .main .item-side { width: 100%; text-align: left; }
  .admin-shell .main .preview { width: 100%; }
  .admin-shell .main .el-col-12 { max-width: 100%; flex: 0 0 100%; }
}
</style>
