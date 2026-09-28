<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="brand" @click="router.push('/')">
        <span class="seal">晋</span>
        <div class="brand-text">
          <div class="name">应游晋游</div>
          <div class="sub">景区运营管理平台</div>
        </div>
      </div>

      <el-menu :default-active="route.path" router class="menu" :default-openeds="['ops', 'fb', 'wo']">
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

      <div class="screen-entry" @click="router.push('/screen')">
        <el-icon><DataAnalysis /></el-icon>
        <div>
          <div class="se-title">数据大屏</div>
          <div class="se-sub">综合 · 舆情 · 商户</div>
        </div>
        <el-icon class="se-arrow"><Right /></el-icon>
      </div>
    </el-aside>

    <el-container class="body">
      <el-header class="header">
        <div class="crumb">
          <span class="crumb-group">{{ route.meta.group }}</span>
          <span class="crumb-sep">/</span>
          <h2>{{ route.meta.title }}</h2>
        </div>
        <div class="right">
          <span class="date">{{ today }}</span>
          <el-badge :value="pendingCount" :hidden="!pendingCount" class="bell">
            <el-icon :size="18" @click="router.push('/feedback')"><Bell /></el-icon>
          </el-badge>
          <el-dropdown @command="onCommand">
            <span class="user">
              <el-avatar :size="30" class="avatar">{{ (user.nickname || '管').slice(0, 1) }}</el-avatar>
              <span class="u-text">
                <b>{{ user.nickname || '景区管理员' }}</b>
                <small>{{ user.scenic || '平遥古城' }} · {{ user.role || '管理员' }}</small>
              </span>
              <el-icon><ArrowDown /></el-icon>
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

const route = useRoute()
const router = useRouter()
const user = JSON.parse(localStorage.getItem('scenic-user') || '{}')
const pendingCount = ref(0)
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

/* ---------- 侧栏：黛青 ---------- */
.aside {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(201, 164, 92, 0.08), transparent 160px),
    linear-gradient(180deg, #2b3a4a 0%, #1f2b37 100%);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.12);
  z-index: 11;
}
.aside::after {
  /* 底部远山剪影 */
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 140px;
  opacity: 0.12;
  pointer-events: none;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 140' preserveAspectRatio='none'%3E%3Cpath d='M0 90 L30 60 L55 78 L90 38 L120 70 L150 50 L185 80 L220 55 V140 H0Z' fill='%23c9a45c'/%3E%3Cpath d='M0 115 L40 95 L70 108 L110 88 L150 104 L190 92 L220 100 V140 H0Z' fill='%23c9a45c' opacity='.6'/%3E%3C/svg%3E") bottom / 100% 100% no-repeat;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 72px;
  padding: 0 20px;
  flex-shrink: 0;
  cursor: pointer;
  border-bottom: 1px solid rgba(201, 164, 92, 0.18);
}
.seal {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  font-family: var(--font-brush);
  font-size: 24px;
  color: #fff6e6;
  background: linear-gradient(135deg, #c9483a, #962c23);
  border-radius: 4px;
  box-shadow: inset 0 0 0 2px rgba(255, 246, 230, 0.35), 0 2px 6px rgba(0, 0, 0, 0.25);
}
.name {
  font-family: var(--font-brush);
  font-size: 22px;
  letter-spacing: 4px;
  line-height: 1.1;
  color: #f0d9a2;
}
.sub {
  margin-top: 3px;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(233, 223, 200, 0.55);
}

.menu {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  border-right: none;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: rgba(201, 164, 92, 0.08);
  --el-menu-text-color: #c3cbd4;
  --el-menu-active-color: #fff;
  --el-menu-item-height: 44px;
  --el-menu-sub-item-height: 42px;
}
.menu :deep(.el-sub-menu__title) {
  color: rgba(233, 223, 200, 0.55);
  font-size: 13px;
  letter-spacing: 1px;
}
.menu :deep(.el-sub-menu__title:hover) {
  background: transparent;
}
.menu :deep(.el-menu-item) {
  position: relative;
  margin: 2px 12px;
  padding-left: 40px !important;
  border-radius: 4px;
  font-size: 14px;
}
.menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #b83a2f, #9a3027);
  box-shadow: 0 4px 10px rgba(150, 44, 35, 0.35);
}
.menu :deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 50%;
  width: 6px;
  height: 6px;
  transform: translateY(-50%) rotate(45deg);
  background: #f0d9a2;
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
  background: linear-gradient(135deg, rgba(14, 26, 51, 0.9), rgba(28, 50, 100, 0.9));
  border: 1px solid rgba(201, 164, 92, 0.45);
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.screen-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
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
}

/* ---------- 顶栏 ---------- */
.body {
  min-width: 0;
  background: var(--xuan);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: rgba(255, 253, 248, 0.92);
  border-bottom: 1px solid var(--line);
}
.crumb {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.crumb-group {
  font-size: 13px;
  color: var(--mo-3);
}
.crumb-sep {
  color: #cfc3ad;
}
.crumb h2 {
  margin: 0;
  font-family: var(--font-title);
  font-size: 21px;
  font-weight: normal;
  letter-spacing: 2px;
  color: var(--mo);
}
.right {
  display: flex;
  align-items: center;
  gap: 22px;
}
.date {
  font-size: 13px;
  color: var(--mo-3);
}
.bell {
  display: flex;
  color: var(--mo-2);
  cursor: pointer;
}
.user {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--mo);
  cursor: pointer;
  outline: none;
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
  background: var(--dai);
  color: #f0d9a2;
}

/* ---------- 内容 ---------- */
.main {
  padding: 20px 24px;
  overflow-y: auto;
  background:
    radial-gradient(circle at 100% 0%, rgba(201, 164, 92, 0.08), transparent 380px),
    var(--xuan);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
}
</style>
