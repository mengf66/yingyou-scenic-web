<template>
  <div class="amount-container">
    <div v-for="(digit, index) in digits" :key="index" class="digit-box">
      <div class="position-label">{{ positions[index] }}</div>
      <div class="digit">{{ digit }}</div>
      <div v-if="showComma(index)" class="comma">,</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  computed: {
    digits() {
      return String(this.value).padStart(9, '0').split('')
    },
    positions() {
      return ['亿', '千', '百', '十', '万', '千', '百', '十', '个']
    }
  },
  methods: {
    showComma(index) {
      return index === 2 || index === 5
    }
  }
}
</script>

<style scoped>
.amount-container {
  position: absolute;
  display: flex;
  top: 32px;
  right: 2px;
  height: 100%;
  align-items: center;
  padding: 0 20px;
}

.digit-box {
  position: relative;
  margin: 0 10px;
}

.digit {
  width: 60px;
  height: 80px;
  background: #1e90ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
}

.position-label {
  position: absolute;
  top: -32px;
  font-size: 20px;
  color: #8c9eb5;
  width: 100%;
  text-align: center;
}

.comma {
  position: absolute;
  right: -8px;
  bottom: 5px;
  color: #8c9eb5;
  font-weight: bold;
}
</style>
