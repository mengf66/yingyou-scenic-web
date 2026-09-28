<template>
  <div class="login-page">
    <!-- 左：国风画卷 -->
    <section class="scroll">
      <svg class="scene" viewBox="0 0 960 1080" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0c1735" />
            <stop offset=".6" stop-color="#16295a" />
            <stop offset="1" stop-color="#1d3569" />
          </linearGradient>
          <radialGradient id="moon" cx=".5" cy=".5" r=".5">
            <stop offset="0" stop-color="#fff6dc" />
            <stop offset=".7" stop-color="#f0d9a2" />
            <stop offset="1" stop-color="#f0d9a2" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2f4d8a" />
            <stop offset="1" stop-color="#18305e" stop-opacity=".2" />
          </linearGradient>
          <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#223d74" />
            <stop offset="1" stop-color="#132652" />
          </linearGradient>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#a8823f" />
            <stop offset=".5" stop-color="#f0d9a2" />
            <stop offset="1" stop-color="#a8823f" />
          </linearGradient>
        </defs>
        <rect width="960" height="1080" fill="url(#sky)" />
        <circle cx="690" cy="250" r="120" fill="url(#moon)" opacity=".9" />
        <!-- 云纹 -->
        <g fill="none" stroke="#d9b36a" stroke-opacity=".35" stroke-width="2">
          <path d="M80 300 q40 -40 80 0 q40 -40 80 0 q20 -24 46 -6" />
          <path d="M520 380 q30 -30 60 0 q30 -30 60 0" />
        </g>
        <!-- 远山 -->
        <path d="M0 680 L120 560 L230 620 L380 460 L520 600 L640 520 L780 640 L960 540 V1080 H0Z" fill="url(#m1)" opacity=".7" />
        <path d="M0 760 L160 670 L300 730 L460 640 L620 740 L800 670 L960 720 V1080 H0Z" fill="url(#m2)" />
        <!-- 城墙与楼阁 -->
        <g fill="#0c1a3c">
          <rect x="0" y="800" width="960" height="60" />
          <g v-for="i in 32" :key="i"><rect :x="(i - 1) * 30 + 4" y="786" width="18" height="16" /></g>
          <!-- 市楼（平遥古城地标） -->
          <rect x="400" y="680" width="160" height="122" />
          <path d="M350 692 L610 692 L574 652 L386 652 Z" />
          <rect x="428" y="610" width="104" height="44" />
          <path d="M392 620 L568 620 L540 586 L420 586 Z" />
          <rect x="452" y="552" width="56" height="36" />
          <path d="M428 560 L532 560 L512 530 L448 530 Z" />
          <rect x="477" y="506" width="6" height="26" />
          <!-- 城门洞 -->
          <path d="M456 802 V744 Q480 718 504 744 V802 Z" fill="#1e3669" />
          <!-- 左右角楼 -->
          <rect x="90" y="740" width="110" height="62" />
          <path d="M66 748 L224 748 L200 722 L90 722 Z" />
          <rect x="760" y="740" width="110" height="62" />
          <path d="M736 748 L894 748 L870 722 L760 722 Z" />
        </g>
        <!-- 金色描边 -->
        <path d="M350 692 L386 652 L574 652 L610 692 M392 620 L420 586 L540 586 L568 620 M428 560 L448 530 L512 530 L532 560" fill="none" stroke="url(#gold)" stroke-width="2" />
        <path d="M0 800 H960" stroke="url(#gold)" stroke-width="1.5" opacity=".6" />
        <!-- 灯笼 -->
        <g v-for="(x, i) in [370, 590, 150, 810]" :key="i" :transform="`translate(${x} ${i < 2 ? 700 : 756})`">
          <line x1="0" y1="-8" x2="0" y2="0" stroke="#d9b36a" />
          <ellipse cx="0" cy="10" rx="9" ry="11" fill="#c9483a" class="lantern" />
          <rect x="-4" y="20" width="8" height="3" fill="#d9b36a" />
        </g>
        <rect x="0" y="860" width="960" height="220" fill="#0b1633" />
        <g stroke="#d9b36a" stroke-opacity=".18" stroke-width="2" fill="none">
          <path d="M60 920 Q300 900 520 925 T920 915" />
          <path d="M20 980 Q260 960 500 985 T940 970" />
        </g>
      </svg>
      <div class="scroll-text">
        <h2>应游晋游</h2>
        <p class="slogan">千年古城 · 智慧文旅</p>
        <p class="desc">黄河流域古城文旅融合创意服务平台</p>
      </div>
      <div class="vertical">筑兴三乡　游治共创</div>
    </section>

    <!-- 右：登录 -->
    <section class="panel">
      <div class="card">
        <div class="head">
          <span class="seal">晋</span>
          <div>
            <h1>山西智慧旅游大数据中心</h1>
            <p class="sub">景区端 · 运营管理平台</p>
          </div>
        </div>

        <div class="switch-tabs">
          <span :class="{ on: mode === 'login' }" @click="mode = 'login'">账号登录</span>
          <span :class="{ on: mode === 'register' }" @click="mode = 'register'">注册账号</span>
        </div>

        <el-form v-if="mode === 'login'" ref="loginRef" :model="loginForm" :rules="loginRules" size="large" @submit.prevent="onLogin">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名" :prefix-icon="User" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password @keyup.enter="onLogin" />
          </el-form-item>
          <div class="row">
            <el-checkbox v-model="remember">记住账号</el-checkbox>
            <span class="hint">演示账号 admin / 123456</span>
          </div>
          <el-button type="primary" class="submit" :loading="loading" @click="onLogin">登　录</el-button>
        </el-form>

        <el-form v-else ref="regRef" :model="regForm" :rules="regRules" size="large">
          <el-form-item prop="username">
            <el-input v-model="regForm.username" placeholder="用户名（4-16 位字母/数字）" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input v-model="regForm.nickname" placeholder="姓名 / 昵称" :prefix-icon="Postcard" />
          </el-form-item>
          <el-form-item prop="scenic">
            <el-select v-model="regForm.scenic" placeholder="所属景区" style="width: 100%">
              <el-option v-for="s in SCENICS" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="regForm.password" type="password" placeholder="密码（至少 6 位）" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item prop="confirm">
            <el-input v-model="regForm.confirm" type="password" placeholder="确认密码" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-button type="primary" class="submit" :loading="loading" @click="onRegister">注　册</el-button>
        </el-form>

        <div class="foot">
          <span>© 应游晋游团队 · 景区端</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Postcard } from '@element-plus/icons-vue'
import { login, register } from '@/api'
import { SCENICS } from '@/api/mockDb'

const router = useRouter()
const route = useRoute()
const mode = ref('login')
const loading = ref(false)
const remember = ref(!!localStorage.getItem('scenic-remember'))

const loginRef = ref()
const loginForm = reactive({ username: localStorage.getItem('scenic-remember') || '', password: '' })
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const regRef = ref()
const regForm = reactive({ username: '', nickname: '', scenic: '平遥古城', password: '', confirm: '' })
const regRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]{4,16}$/, message: '4-16 位字母、数字或下划线', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  scenic: [{ required: true, message: '请选择所属景区', trigger: 'change' }],
  password: [{ required: true, min: 6, message: '密码至少 6 位', trigger: 'blur' }],
  confirm: [{
    validator: (_, v, cb) => (v === regForm.password ? cb() : cb(new Error('两次输入的密码不一致'))),
    trigger: 'blur'
  }]
}

async function onLogin() {
  await loginRef.value.validate()
  loading.value = true
  try {
    const { token, user } = await login(loginForm)
    localStorage.setItem('scenic-token', token)
    localStorage.setItem('scenic-user', JSON.stringify(user))
    remember.value ? localStorage.setItem('scenic-remember', loginForm.username) : localStorage.removeItem('scenic-remember')
    ElMessage.success(`欢迎回来，${user.nickname}`)
    router.replace(route.query.redirect || '/')
  } catch (e) {
    ElMessage.error(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}

async function onRegister() {
  await regRef.value.validate()
  loading.value = true
  try {
    await register(regForm)
    ElMessage.success('注册成功，请登录')
    loginForm.username = regForm.username
    loginForm.password = ''
    mode.value = 'login'
  } catch (e) {
    ElMessage.error(e.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  height: 100vh;
  min-height: 640px;
  background: var(--xuan);
}

/* ---------- 左：画卷 ---------- */
.scroll {
  position: relative;
  overflow: hidden;
  background: #0c1735;
}
.scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.lantern {
  animation: glow 3s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(233, 110, 80, 0.8));
}
@keyframes glow {
  50% { opacity: 0.75; }
}
.scroll-text {
  position: absolute;
  left: 9%;
  top: 14%;
  color: #f0d9a2;
}
.scroll-text h2 {
  margin: 0;
  font-family: var(--font-brush);
  font-size: 84px;
  font-weight: normal;
  letter-spacing: 12px;
  line-height: 1.1;
  background: linear-gradient(180deg, #fff6dc 0%, #f0d9a2 50%, #c9a45c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}
.slogan {
  margin: 14px 0 6px 4px;
  font-family: var(--font-title);
  font-size: 22px;
  letter-spacing: 8px;
  color: #e9dfc8;
}
.desc {
  margin: 0 0 0 4px;
  font-size: 13px;
  letter-spacing: 3px;
  color: rgba(233, 223, 200, 0.55);
}
.vertical {
  position: absolute;
  right: 7%;
  top: 12%;
  writing-mode: vertical-rl;
  font-family: var(--font-title);
  font-size: 18px;
  letter-spacing: 10px;
  color: rgba(240, 217, 162, 0.7);
  padding: 14px 8px;
  border-left: 1px solid rgba(217, 179, 106, 0.4);
  border-right: 1px solid rgba(217, 179, 106, 0.4);
}

/* ---------- 右：登录卡 ---------- */
.panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 90% 10%, rgba(201, 164, 92, 0.12), transparent 320px),
    radial-gradient(circle at 10% 95%, rgba(184, 58, 47, 0.06), transparent 300px),
    var(--xuan);
}
.panel::before {
  /* 回纹边框 */
  content: '';
  position: absolute;
  inset: 28px;
  border: 1px solid #e0d3bb;
  pointer-events: none;
}
.card {
  position: relative;
  width: 420px;
}
.head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
}
.seal {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  font-family: var(--font-brush);
  font-size: 32px;
  color: #fff6e6;
  background: linear-gradient(135deg, #c9483a, #962c23);
  border-radius: 6px;
  box-shadow: inset 0 0 0 3px rgba(255, 246, 230, 0.35), 0 4px 10px rgba(150, 44, 35, 0.3);
}
h1 {
  margin: 0;
  font-family: var(--font-brush);
  font-size: 27px;
  font-weight: normal;
  letter-spacing: 1px;
  white-space: nowrap;
  color: var(--mo);
}
.sub {
  margin: 4px 0 0;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--mo-3);
}
.switch-tabs {
  display: flex;
  gap: 28px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--line);
}
.switch-tabs span {
  position: relative;
  padding-bottom: 10px;
  font-family: var(--font-title);
  font-size: 17px;
  letter-spacing: 2px;
  color: var(--mo-3);
  cursor: pointer;
}
.switch-tabs span.on {
  color: var(--zhu);
}
.switch-tabs span.on::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--zhu);
}
.card :deep(.el-input__wrapper),
.card :deep(.el-select__wrapper) {
  background: #fffdf8;
  box-shadow: 0 0 0 1px #ddd2bf inset;
}
.card :deep(.el-input__wrapper.is-focus),
.card :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px var(--zhu) inset;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -6px 0 18px;
}
.hint {
  font-size: 12px;
  color: var(--mo-3);
}
.submit {
  width: 100%;
  height: 44px;
  font-family: var(--font-title);
  font-size: 18px;
  letter-spacing: 6px;
  background: linear-gradient(180deg, #c9483a, #a3342a);
  border: none;
  box-shadow: 0 6px 14px rgba(150, 44, 35, 0.25);
}
.submit:hover {
  background: linear-gradient(180deg, #d4584a, #b03a2f);
}
.foot {
  margin-top: 36px;
  text-align: center;
  font-size: 12px;
  color: var(--mo-3);
}
</style>
