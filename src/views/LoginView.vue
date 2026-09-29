<template>
  <div class="login-page">
    <!-- 背景：平遥古城城楼水墨画，左侧雾气留白放登录框 -->
    <div class="bg" aria-hidden="true"></div>
    <div class="vertical" aria-hidden="true">
      <span>筑兴三乡</span><span>游治共创</span>
      <i class="mini-seal">晋</i>
    </div>

    <!-- 登录卡（位于画面左侧留白处） -->
    <section class="panel">
      <div class="card">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        <div class="head">
          <img class="seal" :src="sealLogo" alt="应游晋游" width="60" height="60" />
          <div>
            <h1>山西智慧旅游大数据中心</h1>
            <p class="sub">景区端 · 运营管理平台</p>
          </div>
        </div>
        <p class="slogan"><span>千年古城</span><i>◆</i><span>智慧文旅</span></p>

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
import sealLogo from '@/assets/guofeng/seal-logo.webp'

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
  min-height: 640px;
  overflow: hidden;
  background: #efe8da;
}

/* ---------- 背景画卷 ---------- */
.bg {
  position: absolute;
  inset: 0;
  background: url('@/assets/guofeng/scenic-login-bg.webp') right center / cover no-repeat;
  animation: drift 1.6s ease-out both;
}
.bg::after {
  /* 左侧加一层宣纸雾，保证登录框区域干净 */
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(246, 241, 231, 0.55) 0%, rgba(246, 241, 231, 0.25) 38%, transparent 55%),
    linear-gradient(0deg, rgba(246, 241, 231, 0.35), transparent 30%);
}
@keyframes drift {
  from {
    opacity: 0;
    transform: scale(1.03);
  }
}

.vertical {
  position: absolute;
  left: 49%;
  top: 9%;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 14px;
  writing-mode: vertical-rl;
  font-family: var(--font-title);
  font-size: 22px;
  letter-spacing: 12px;
  color: rgba(42, 37, 34, 0.72);
  animation: fadeIn 1.2s 0.4s ease-out both;
}
.vertical span:last-of-type {
  margin-top: 44px;
}
.mini-seal {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  margin-top: 8px;
  font-style: normal;
  font-family: var(--font-brush);
  font-size: 17px;
  letter-spacing: 0;
  writing-mode: horizontal-tb;
  color: #fff6e6;
  background: #b83a2f;
  border-radius: 3px;
  box-shadow: inset 0 0 0 2px rgba(255, 246, 230, 0.4);
  opacity: 0.9;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
}

/* ---------- 登录卡 ---------- */
.panel {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46%;
  min-width: 520px;
  height: 100%;
}
.card {
  position: relative;
  width: 440px;
  padding: 36px 44px 26px;
  background:
    var(--tex-paper),
    linear-gradient(180deg, rgba(255, 253, 248, 0.9), rgba(250, 245, 234, 0.9));
  border: 1px solid rgba(201, 164, 92, 0.55);
  border-radius: 2px;
  box-shadow:
    inset 0 0 0 5px rgba(255, 253, 248, 0.6),
    inset 0 0 0 6px rgba(201, 164, 92, 0.35),
    0 30px 60px -20px rgba(60, 45, 25, 0.35),
    0 2px 6px rgba(60, 45, 25, 0.08);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  animation: rise 0.8s 0.15s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.card::before {
  /* 顶部回纹饰带 */
  content: '';
  position: absolute;
  left: 22px;
  right: 22px;
  top: 12px;
  height: 10px;
  opacity: 0.7;
  background: var(--huiwen) left center / 16px 10px repeat-x;
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}
.corner {
  position: absolute;
  width: 22px;
  height: 22px;
  pointer-events: none;
}
.corner.tl { left: -6px; top: -6px; background: var(--corner-tl) center / contain no-repeat; }
.corner.tr { right: -6px; top: -6px; background: var(--corner-tr) center / contain no-repeat; }
.corner.bl { left: -6px; bottom: -6px; background: var(--corner-bl) center / contain no-repeat; }
.corner.br { right: -6px; bottom: -6px; background: var(--corner-br) center / contain no-repeat; }

.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  text-align: center;
}
.seal {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  transform: rotate(-4deg);
  filter: drop-shadow(0 3px 6px rgba(150, 44, 35, 0.25));
}
h1 {
  margin: 0;
  font-family: var(--font-brush);
  font-size: 27px;
  font-weight: normal;
  letter-spacing: 3px;
  white-space: nowrap;
  color: var(--mo);
}
.sub {
  margin: 6px 0 0;
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--mo-3);
}
.slogan {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 12px 0 22px;
  font-family: var(--font-title);
  font-size: 14px;
  letter-spacing: 6px;
  color: #8a6a2f;
}
.slogan::before,
.slogan::after {
  content: '';
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 164, 92, 0.8));
}
.slogan::after {
  transform: scaleX(-1);
}
.slogan span {
  white-space: nowrap;
}
.slogan i {
  font-style: normal;
  font-size: 8px;
  letter-spacing: 0;
  color: var(--zhu);
}

.switch-tabs {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(201, 164, 92, 0.3);
}
.switch-tabs span {
  position: relative;
  padding-bottom: 10px;
  font-family: var(--font-title);
  font-size: 17px;
  letter-spacing: 3px;
  color: var(--mo-3);
  cursor: pointer;
  transition: color 0.2s ease;
}
.switch-tabs span:hover {
  color: var(--mo);
}
.switch-tabs span.on {
  color: var(--zhu);
}
.switch-tabs span::after {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: -1px;
  height: 2px;
  background: var(--zhu);
  transition: left 0.25s ease, right 0.25s ease;
}
.switch-tabs span.on::after {
  left: 0;
  right: 0;
}
.card :deep(.el-input__wrapper),
.card :deep(.el-select__wrapper) {
  background: rgba(255, 253, 248, 0.92);
  box-shadow: 0 0 0 1px #dccfb6 inset;
}
.card :deep(.el-input__wrapper:hover),
.card :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #c9a45c inset;
}
.card :deep(.el-input__wrapper.is-focus),
.card :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px var(--zhu) inset, 0 0 0 3px rgba(184, 58, 47, 0.08);
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
  height: 46px;
  font-family: var(--font-title);
  font-size: 19px;
  letter-spacing: 8px;
}
.foot {
  margin-top: 26px;
  text-align: center;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--mo-3);
}

/* ---------- 中小屏 ---------- */
@media (max-width: 1100px) {
  .panel {
    width: 100%;
    min-width: 0;
  }
  .vertical {
    display: none;
  }
  .bg {
    background-position: 72% center;
  }
  .bg::after {
    background: rgba(246, 241, 231, 0.35);
  }
}
@media (max-width: 520px) {
  .login-page {
    min-height: 100vh;
    height: auto;
    overflow: auto;
  }
  .panel {
    min-height: 100vh;
    padding: 28px 16px;
    box-sizing: border-box;
  }
  .card {
    width: 100%;
    padding: 30px 22px 20px;
    background:
      var(--tex-paper),
      linear-gradient(180deg, rgba(255, 253, 248, 0.94), rgba(250, 245, 234, 0.94));
  }
  h1 {
    font-size: 22px;
    letter-spacing: 1px;
  }
  .slogan {
    gap: 8px;
    letter-spacing: 3px;
  }
  .slogan::before,
  .slogan::after {
    width: 28px;
  }
  .sub {
    letter-spacing: 2px;
  }
  .hint {
    font-size: 11px;
  }
}
</style>
