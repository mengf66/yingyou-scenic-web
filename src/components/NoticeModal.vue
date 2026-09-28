<template>
  <div class="notice-modal-mask" @click.self="handleClose">
    <div class="notice-modal">
      <div class="modal-header">
        <h3>景区重要通告</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      <div class="modal-content">
        <div class="notice-list">
          <div v-for="(notice, index) in notices" :key="index" class="notice-item">
            <div class="notice-title">
              <span class="icon">◆</span> {{ notice.title }}</div>
            <div class="notice-time">{{ formatTime(notice.time) }}</div>
            <div class="notice-content">{{ notice.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { listNotices } from '@/api'

export default {
  data() {
    return {
      notices: [
        {
          title: '五台山景区预约限流通知',
          time: 1717027200000,
          content: '为确保游览安全，即日起五台山景区实行预约制，每日限流3万人次，请提前通过官方渠道预约。'
        },
        {
          title: '平遥古城夜间开放调整',
          time: 1716940800000,
          content: '平遥古城夜游项目开放时间调整为19:00-22:00，灯光秀表演时间调整为20:00、21:00各一场。'
        }
      ]
    }
  },
  async mounted() {
    // 与景区端「发布公告」打通：优先展示已发布的最新公告，没有时保留默认通告
    try {
      const list = await listNotices({ status: 'published' })
      if (list.length) {
        this.notices = list.slice(0, 6).map(n => ({
          title: n.title,
          time: new Date(n.updatedAt.replace(/-/g, '/')).getTime(),
          content: n.content
        }))
      }
    } catch (e) {
      // 读取失败时使用默认数据
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.notice-modal-mask {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(4, 9, 22, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.notice-modal {
  position: relative;
  width: 600px;
  max-height: 80vh;
  background: linear-gradient(180deg, #16284f, #0d1936);
  border: 1px solid rgba(217, 179, 106, 0.45);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(217, 179, 106, 0.06);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(217, 179, 106, 0.25);
}

.modal-header h3 {
  margin: 0;
  font-family: var(--font-title);
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 3px;
  color: var(--jin-light);
}

.close-btn {
  padding: 0 8px;
  font-size: 24px;
  color: var(--screen-text-2);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #e07a64;
}

.modal-content {
  padding: 18px 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.notice-item {
  padding: 12px 14px;
  margin-bottom: 12px;
  background: rgba(217, 179, 106, 0.05);
  border-left: 3px solid var(--jin);
}

.notice-title {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--screen-text);
}

.icon {
  margin-right: 8px;
  font-size: 10px;
  color: var(--jin);
}

.notice-time {
  margin-bottom: 8px;
  font-size: 12px;
  font-family: var(--font-num);
  color: var(--screen-text-2);
}

.notice-content {
  font-size: 13px;
  line-height: 1.7;
  color: #cfd6e4;
}
</style>
