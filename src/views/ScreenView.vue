<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="btn-group">
          <button
            v-for="(name, i) in TABS"
            :key="name"
            :class="['tab-btn', { active: currentTab === i }]"
            @click="switchTab(i)"
          >
            {{ name }}
          </button>
        </div>
        <h1 class="title">山西智慧旅游大数据中心</h1>
        <div class="right-group">
          <button class="tab-btn" @click="router.push('/')">运营管理</button>
          <button class="tab-btn ghost" title="全屏" @click="toggleFullscreen">{{ isFull ? '退出全屏' : '全屏' }}</button>
        </div>
      </div>
    </header>

    <main class="main-container">
      <component :is="components[currentTab]" :key="componentKey" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Analysis1 from '@/components/Analysis1.vue'
import Analysis2 from '@/components/Analysis2.vue'
import Analysis3 from '@/components/Analysis3.vue'

const TABS = ['综合分析', '舆情分析', '用户管理']
const components = [Analysis1, Analysis2, Analysis3]

const router = useRouter()
const currentTab = ref(Number(sessionStorage.getItem('screen-tab') || 0))
const componentKey = ref(0)
const isFull = ref(false)

function switchTab(i) {
  // 每次切换都重新挂载组件，保证图表按容器尺寸重新初始化
  componentKey.value += 1
  currentTab.value = i
  sessionStorage.setItem('screen-tab', i)
}

function toggleFullscreen() {
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
}
const onFs = () => (isFull.value = !!document.fullscreenElement)
onMounted(() => document.addEventListener('fullscreenchange', onFs))
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onFs))
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a1d3a;
}

.main-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  scroll-behavior: smooth;
}

.header {
  height: 80px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #1b3a6d 30%, #0a1d3a 100%);
  position: relative;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30px;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  letter-spacing: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(180deg, #ffffff 0%, #7dabf5 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  margin: 0;
}

.btn-group,
.right-group {
  display: flex;
  gap: 20px;
}

.tab-btn {
  padding: 10px 30px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #a8c7ff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 500;
  outline: none;
}

.tab-btn.ghost {
  padding: 10px 18px;
}

.tab-btn:hover {
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(90deg, #2a5bac 0%, #3b7ad9 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(42, 91, 172, 0.4);
}
</style>
