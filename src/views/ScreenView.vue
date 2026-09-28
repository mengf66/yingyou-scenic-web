<template>
  <div class="screen">
    <header class="header">
      <!-- 左侧标签 -->
      <nav class="tabs left">
        <button v-for="(name, i) in TABS" :key="name" :class="['tab', { active: currentTab === i }]" @click="switchTab(i)">
          {{ name }}
        </button>
      </nav>

      <!-- 中间标题（屋檐造型） -->
      <div class="title-wrap">
        <svg class="eave" viewBox="0 0 760 84" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="eaveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#1c3264" />
              <stop offset="1" stop-color="#0f1e42" />
            </linearGradient>
            <linearGradient id="eaveGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#a8823f" stop-opacity="0" />
              <stop offset=".2" stop-color="#e8cf94" />
              <stop offset=".5" stop-color="#f6e2ae" />
              <stop offset=".8" stop-color="#e8cf94" />
              <stop offset="1" stop-color="#a8823f" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 2 H760 L700 64 Q690 76 676 76 H84 Q70 76 60 64 Z" fill="url(#eaveFill)" />
          <path d="M0 2 H760 L700 64 Q690 76 676 76 H84 Q70 76 60 64 Z" fill="none" stroke="url(#eaveGold)" stroke-width="1.5" />
          <path d="M92 82 H668" stroke="url(#eaveGold)" stroke-width="1" opacity=".6" />
        </svg>
        <div class="title">
          <span class="ornament">◆</span>
          <h1>山西智慧旅游大数据中心</h1>
          <span class="ornament">◆</span>
        </div>
        <div class="subtitle">应游晋游 · 黄河流域古城文旅融合创意服务平台</div>
      </div>

      <!-- 右侧操作 -->
      <nav class="tabs right">
        <button class="tab" @click="router.push('/')">运营管理</button>
        <button class="tab ghost" @click="toggleFullscreen">{{ isFull ? '退出全屏' : '全屏展示' }}</button>
      </nav>
    </header>

    <main class="main">
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

const TABS = ['综合分析', '舆情分析', '商户经营']
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
.screen {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 720px;
  overflow: hidden;
  color: var(--screen-text);
  background:
    radial-gradient(ellipse at 50% 0%, rgba(217, 179, 106, 0.12), transparent 55%),
    radial-gradient(ellipse at 50% 100%, rgba(40, 80, 150, 0.35), transparent 60%),
    linear-gradient(180deg, #0c1735 0%, #0a1330 100%);
}
.screen::before {
  /* 回纹底纹 */
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image:
    linear-gradient(90deg, #d9b36a 1px, transparent 1px),
    linear-gradient(#d9b36a 1px, transparent 1px);
  background-size: 28px 28px;
}

/* ---------- 顶栏 ---------- */
.header {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 760px 1fr;
  align-items: start;
  flex-shrink: 0;
  height: 88px;
  padding: 0 22px;
}
.header::after {
  content: '';
  position: absolute;
  left: 22px;
  right: 22px;
  top: 44px;
  height: 1px;
  background: linear-gradient(90deg, rgba(217, 179, 106, 0.5), rgba(217, 179, 106, 0.08) 30%, transparent 40%, transparent 60%, rgba(217, 179, 106, 0.08) 70%, rgba(217, 179, 106, 0.5));
  z-index: 0;
}
.tabs {
  display: flex;
  gap: 10px;
  padding-top: 24px;
  z-index: 1;
}
.tabs.right {
  justify-content: flex-end;
}
.tab {
  position: relative;
  min-width: 104px;
  height: 34px;
  padding: 0 18px;
  font-family: var(--font-title);
  font-size: 16px;
  letter-spacing: 3px;
  color: var(--screen-text-2);
  background: linear-gradient(180deg, rgba(28, 50, 100, 0.9), rgba(15, 30, 66, 0.9));
  border: 1px solid rgba(217, 179, 106, 0.25);
  clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%);
  cursor: pointer;
  transition: all 0.25s;
}
.tab:hover {
  color: var(--jin-light);
}
.tab.active {
  color: #1a1206;
  background: linear-gradient(180deg, #f3dca3 0%, #d9b36a 55%, #b8904a 100%);
  border-color: var(--jin-light);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
}
.tab.ghost {
  min-width: 0;
  font-size: 14px;
  letter-spacing: 1px;
}

.title-wrap {
  position: relative;
  height: 84px;
  text-align: center;
  z-index: 1;
}
.eave {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
}
.title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 10px;
}
.ornament {
  font-size: 10px;
  color: var(--jin);
}
h1 {
  margin: 0;
  font-family: var(--font-brush);
  font-size: 36px;
  font-weight: normal;
  letter-spacing: 8px;
  line-height: 1.15;
  background: linear-gradient(180deg, #fff6dc 0%, #f0d9a2 45%, #c9a45c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 6px rgba(217, 179, 106, 0.35));
}
.subtitle {
  position: relative;
  margin-top: 2px;
  font-size: 12px;
  letter-spacing: 4px;
  color: rgba(233, 223, 200, 0.6);
}

/* ---------- 内容 ---------- */
.main {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 6px 20px 18px;
}
</style>
