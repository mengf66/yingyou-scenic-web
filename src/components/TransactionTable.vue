<template>
  <div class="transaction-table">
    <div class="table-header">
      <div class="header-cell">用户</div>
      <div class="header-cell">时间</div>
      <div class="header-cell">操作</div>
      <div class="header-cell">商品</div>
    </div>
    <div class="table-body">
      <div
          v-for="(item, index) in data"
          :key="index"
          :class="['table-row', { 'even-row': index % 2 === 0 }]"
      >
        <div class="body-cell user">{{ formatPhone(item.user) }}</div>
        <div class="body-cell time">{{ formatTime(item.time) }}</div>
        <div class="body-cell">
          <span :class="['operation-tag', item.action]">{{ item.action }}</span>
        </div>
        <div class="body-cell product">{{ item.product }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 手机号脱敏：138****1234
    formatPhone(phone) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const pad = (n) => n.toString().padStart(2, '0')
      return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
  }
}
</script>

<style scoped>
.transaction-table {
  height: 100%;
  color: #fff;
  font-size: 12px;
}

.table-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: rgba(42, 91, 172, 0.3);
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.header-cell {
  text-align: center;
  font-weight: 500;
  color: #7db2ff;
}

.table-body {
  height: calc(100% - 38px);
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 10px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.even-row {
  background: rgba(255, 255, 255, 0.03);
}

.body-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}

.operation-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
}

.operation-tag.下单 {
  background: rgba(111, 207, 151, 0.2);
  color: #6dd230;
}

.operation-tag.退货 {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

.table-body::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.table-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
</style>
