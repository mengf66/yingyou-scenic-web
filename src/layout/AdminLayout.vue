<template>
  <el-container class="layout">
    <el-header class="header">
      <div class="brand" @click="router.push('/')">
        <span class="logo">晋</span>
        <span class="name">山西智慧旅游大数据中心</span>
        <span class="tag">景区端</span>
      </div>
      <nav class="topnav">
        <a @click="router.push('/screen')"><el-icon><DataAnalysis /></el-icon>数据大屏</a>
        <a class="active"><el-icon><Setting /></el-icon>运营管理</a>
      </nav>
      <div class="right">
        <el-badge :value="pendingCount" :hidden="!pendingCount" class="bell">
          <el-icon :size="18" @click="router.push('/feedback')"><Bell /></el-icon>
        </el-badge>
        <el-dropdown @command="onCommand">
          <span class="user">
            <el-avatar :size="28" class="avatar">{{ (user.nickname || '管').slice(0, 1) }}</el-avatar>
            {{ user.nickname || '景区管理员' }}<small v-if="user.scenic"> · {{ user.scenic }}</small>
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
    <el-container class="body">
      <el-aside width="210px" class="aside">
        <el-menu :default-active="route.path" router background-color="#0f2350" text-color="#b8c9ea" active-text-color="#ffffff" :default-openeds="['ops', 'fb', 'wo']">
          <el-sub-menu index="ops">
            <template #title><el-icon><Notification /></el-icon><span>景区运营</span></template>
            <el-menu-item index="/notice">发布公告</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="fb">
            <template #title><el-icon><ChatLineRound /></el-icon><span>反馈与预警</span></template>
            <el-menu-item index="/feedback">接收反馈</el-menu-item>
            <el-menu-item index="/warning">安全预警</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="wo">
            <template #title><el-icon><Tickets /></el-icon><span>工单管理</span></template>
            <el-menu-item index="/workorder/create">工单创建与分派</el-menu-item>
            <el-menu-item index="/workorder/track">工单流程追踪</el-menu-item>
            <el-menu-item index="/workorder/stats">工单统计与分析</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <div class="crumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ route.meta.group }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
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
import { DataAnalysis, Setting, Bell, ArrowDown, RefreshLeft, SwitchButton, Notification, ChatLineRound, Tickets } from '@element-plus/icons-vue'
import { listFeedbacks, resetDemoData } from '@/api'

const route = useRoute()
const router = useRouter()
const user = JSON.parse(localStorage.getItem('scenic-user') || '{}')
const pendingCount = ref(0)

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
.header {
  height: 56px;
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #13306a 0%, #0a1d3a 100%);
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
  z-index: 10;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 330px;
}
.logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #3f8cff, #2a5bac);
  font-family: 'STKaiti', 'KaiTi', serif;
  font-size: 20px;
}
.name {
  font-size: 18px;
  letter-spacing: 2px;
  font-weight: 600;
}
.tag {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
}
.topnav {
  display: flex;
  gap: 6px;
  flex: 1;
}
.topnav a {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 16px;
  color: #a8c7ff;
  cursor: pointer;
  font-size: 14px;
}
.topnav a:hover {
  background: rgba(255, 255, 255, 0.08);
}
.topnav a.active {
  background: linear-gradient(90deg, #2a5bac 0%, #3b7ad9 100%);
  color: #fff;
}
.right {
  display: flex;
  align-items: center;
  gap: 22px;
}
.bell {
  cursor: pointer;
  color: #cfe0ff;
  display: flex;
}
.user {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e6efff;
  cursor: pointer;
  outline: none;
}
.user small {
  color: #9fb8e6;
}
.avatar {
  background: #3b7ad9;
}
.body {
  height: calc(100vh - 56px);
}
.aside {
  background: #0f2350;
  overflow-y: auto;
}
.aside :deep(.el-menu) {
  border-right: none;
}
.aside :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #2a5bac, #3b7ad9) !important;
}
.aside :deep(.el-sub-menu .el-menu-item) {
  background-color: #0b1b40 !important;
}
.main {
  background: #f0f3f9;
  padding: 16px 20px;
  overflow-y: auto;
}
.crumb {
  margin-bottom: 14px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
