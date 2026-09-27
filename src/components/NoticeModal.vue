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
              <span class="icon">🔔</span> {{ notice.title }}</div>
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.notice-modal {
  width: 600px;
  max-height: 80vh;
  background: #0a1d3a;
  border-radius: 8px;
  border: 1px solid rgba(42, 91, 172, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: #7db2ff;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #8c9eb5;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
  transition: all 0.3s;
}

.close-btn:hover {
  color: #ff4d4d;
}

.modal-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.notice-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.notice-title {
  color: #6dd230;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
}

.notice-time {
  color: #8c9eb5;
  font-size: 12px;
  margin-bottom: 10px;
}

.notice-content {
  color: #e6f7ff;
  line-height: 1.6;
  font-size: 14px;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
</style>
