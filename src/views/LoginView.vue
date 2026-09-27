<template>
  <div class="login-page">
    <!-- 远山与古城剪影 -->
    <svg class="scene" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="mt1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a5bb8" stop-opacity=".55" />
          <stop offset="1" stop-color="#0b2257" stop-opacity=".2" />
        </linearGradient>
        <linearGradient id="mt2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1d4596" stop-opacity=".8" />
          <stop offset="1" stop-color="#0a1d4a" stop-opacity=".6" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1a4ea8" stop-opacity=".5" />
          <stop offset="1" stop-color="#081a45" />
        </linearGradient>
      </defs>
      <path d="M0 720 L180 560 L320 640 L520 420 L700 610 L860 540 L1040 660 L1260 470 L1440 600 L1620 520 L1920 650 L1920 1080 L0 1080 Z" fill="url(#mt1)" />
      <path d="M0 800 L240 690 L420 760 L600 660 L820 780 L1080 700 L1300 790 L1520 690 L1760 770 L1920 720 L1920 1080 L0 1080 Z" fill="url(#mt2)" />
      <!-- 城墙与楼阁 -->
      <g fill="#0d2a66" opacity=".95">
        <rect x="0" y="835" width="1920" height="40" />
        <g v-for="i in 48" :key="i"><rect :x="(i - 1) * 40 + 6" y="822" width="24" height="14" /></g>
        <!-- 左侧城楼 -->
        <rect x="470" y="770" width="170" height="66" />
        <path d="M440 776 L670 776 L640 748 L470 748 Z" />
        <rect x="495" y="722" width="120" height="28" />
        <path d="M470 726 L640 726 L612 700 L498 700 Z" />
        <!-- 中央市楼 -->
        <rect x="905" y="740" width="110" height="96" />
        <path d="M872 748 L1048 748 L1020 718 L900 718 Z" />
        <rect x="925" y="690" width="70" height="30" />
        <path d="M900 694 L1020 694 L996 668 L924 668 Z" />
        <rect x="956" y="648" width="8" height="22" />
        <!-- 右侧城楼 -->
        <rect x="1290" y="770" width="170" height="66" />
        <path d="M1260 776 L1490 776 L1460 748 L1290 748 Z" />
        <rect x="1315" y="722" width="120" height="28" />
        <path d="M1290 726 L1460 726 L1432 700 L1318 700 Z" />
      </g>
      <rect x="0" y="875" width="1920" height="205" fill="url(#water)" />
      <g stroke="#6fa8ff" stroke-opacity=".25" stroke-width="2" fill="none">
        <path d="M200 930 Q600 910 960 935 T1720 925" />
        <path d="M80 985 Q520 965 980 990 T1860 975" />
      </g>
    </svg>
    <div class="rain">
      <i v-for="i in 18" :key="i" :style="{ left: (i * 5.3) % 100 + '%', animationDelay: (i % 7) * 0.6 + 's', animationDuration: 3 + (i % 4) + 's' }"></i>
    </div>

    <div class="card">
      <h1>山西智慧旅游大数据中心</h1>
      <p class="sub">Shanxi Smart Tourism Big Data Center</p>

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
        <el-button type="primary" class="submit" :loading="loading" @click="onLogin">登 录</el-button>
        <div class="switch">还没有账号？<a @click="mode = 'register'">立即注册</a></div>
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
        <el-button type="primary" class="submit" :loading="loading" @click="onRegister">注 册</el-button>
        <div class="switch">已有账号？<a @click="mode = 'login'">返回登录</a></div>
      </el-form>
    </div>
    <div class="copyright">应游晋游 · 黄河流域古城文旅融合创意服务平台 · 景区端</div>
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
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #0a1d4a url('../assets/background.png') center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.rain i {
  position: absolute;
  top: -20%;
  width: 1px;
  height: 90px;
  background: linear-gradient(to bottom, transparent, rgba(160, 200, 255, 0.55));
  animation: fall linear infinite;
}
@keyframes fall {
  to { transform: translateY(130vh); }
}
.card {
  position: relative;
  z-index: 2;
  width: 400px;
  padding: 36px 36px 24px;
  border-radius: 10px;
  background: rgba(38, 66, 128, 0.55);
  border: 1px solid rgba(140, 180, 255, 0.35);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45), inset 0 0 30px rgba(90, 150, 255, 0.15);
  backdrop-filter: blur(6px);
  margin-top: -6vh;
}
h1 {
  margin: 0;
  text-align: center;
  font-size: 24px;
  letter-spacing: 4px;
  color: #fff;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.sub {
  margin: 6px 0 26px;
  text-align: center;
  font-size: 12px;
  color: rgba(200, 220, 255, 0.7);
  letter-spacing: 1px;
}
.card :deep(.el-input__wrapper),
.card :deep(.el-select__wrapper) {
  background: rgba(10, 30, 80, 0.55);
  box-shadow: 0 0 0 1px rgba(140, 180, 255, 0.35) inset;
}
.card :deep(.el-input__inner),
.card :deep(.el-select__selected-item) {
  color: #e8f0ff;
}
.card :deep(.el-checkbox__label) {
  color: #cfe0ff;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -6px 0 16px;
}
.hint {
  font-size: 12px;
  color: rgba(200, 220, 255, 0.6);
}
.submit {
  width: 100%;
  letter-spacing: 6px;
  background: linear-gradient(90deg, #2f6fe0, #3f8cff);
  border: none;
}
.switch {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: rgba(200, 220, 255, 0.75);
}
.switch a {
  color: #7fb2ff;
  cursor: pointer;
}
.copyright {
  position: absolute;
  bottom: 18px;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: rgba(200, 220, 255, 0.45);
  z-index: 2;
}
</style>
