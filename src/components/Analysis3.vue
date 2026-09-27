<template>
  <div class="main-container">
    <!-- 第一行 -->
    <div class="container container1">
      <div class="title-box">
        <h3>Online</h3>
      </div>
      <OnlinePie :value="68" :rate="40" :total="100" />
    </div>

    <div class="container container2">
      <div class="title-box">
        <h3>销售总额</h3>
      </div>
      <AmountDisplay :value="24960000" />
    </div>

    <div class="container container3">
      <div class="title-box">
        <h3>Offline</h3>
      </div>
      <OnlinePie :value="32" :rate="-5" :total="100" />
    </div>

    <!-- 店铺统计 -->
    <div class="container container4">
      <div class="shop-stats">
        <ShopChart
            v-for="(item, index) in shopData"
            :key="index"
            :data="item"
        />
        <div class="total-stats">
          <div class="total-item">
            <span>店铺总数</span>
            <div class="value">1,245<span class="unit">家</span></div>
          </div>
          <div class="total-item">
            <span>总销售额</span>
            <div class="value">¥8,560<span class="unit">万元</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="container container5">
      <div class="title-box">
        <h3>销售排行</h3>
      </div>
      <SalesRanking :data="salesRankData" />
    </div>

    <div class="container container6">
      <div class="title-box">
        <h3>今日统计</h3>
      </div>
      <TodayStats :data="todayData" />
    </div>

    <div class="container container7">
      <div class="title-box">
        <h3>线上实时交易</h3>
      </div>
      <TransactionTable :data="onlineTransactions" />
    </div>

    <div class="container container8">
      <div class="title-box">
        <h3>成交分类</h3>
      </div>
      <CategoryPie :data="categoryData" />
    </div>

    <div class="container container9">
      <div class="title-box">
        <h3>成交趋势</h3>
      </div>
      <TrendChart :data="trendData" />
    </div>

    <div class="container container10">
      <div class="title-box">
        <h3>来源分布</h3>
      </div>
      <SourceChart :data="sourceData" />
    </div>

    <div class="container container11">
      <div class="title-box">
        <h3>线下实时交易</h3>
      </div>
      <TransactionTable :data="offlineTransactions" />
    </div>

    <!-- 右上角按钮 -->
    <div class="control-buttons">
      <button class="btn notice-btn" @click="showNotice">景区通告</button>
      <button class="btn admin-btn" @click="gotoAdmin">跳转后台</button>
    </div>

    <NoticeModal v-if="showNoticeModal" @close="showNoticeModal = false" />
  </div>
</template>

<script>
import OnlinePie from './OnlinePie.vue'
import AmountDisplay from './AmountDisplay.vue'
import ShopChart from './ShopChart.vue'
import SalesRanking from './SalesRanking.vue'
import TodayStats from './TodayStats.vue'
import CategoryPie from './CategoryPie.vue'
import TrendChart from './TrendChart.vue'
import SourceChart from './SourceChart.vue'
import TransactionTable from './TransactionTable.vue'
import NoticeModal from './NoticeModal.vue'

export default {
  components: {
    OnlinePie,
    AmountDisplay,
    ShopChart,
    SalesRanking,
    TodayStats,
    CategoryPie,
    TrendChart,
    SourceChart,
    TransactionTable,
    NoticeModal
  },
  data() {
    return {
      showNoticeModal: false,
      shopData: [
        { value: 560, color: '#FFD700', label: '酒店' },
        { value: 420, color: '#00BFFF', label: '餐饮' },
        { value: 265, color: '#98FB98', label: '旅拍' }
      ],
      salesRankData: [
        { name: '平遥特产旗舰店', value: 256 },
        { name: '五台山文创中心', value: 189 },
        { name: '云冈石窟纪念品店', value: 156 },
        { name: '晋商文化体验馆', value: 132 },
        { name: '黄河风情特产店', value: 115 },
        { name: '山西老陈醋直营店', value: 98 },
        { name: '太行山土产专卖', value: 85 }
      ],
      todayData: {
        amount: '245,600',
        count: '1,245'
      },
      categoryData: [
        { name: '餐饮', value: 45 },
        { name: '酒店', value: 30 },
        { name: '旅拍', value: 15 },
        { name: '文创', value: 10 }
      ],
      trendData: {
        xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        values: [120, 80, 200, 350, 280, 420, 180]
      },
      sourceData: [
        { name: '山西', value: 31 },
        { name: '山东', value: 18 },
        { name: '广东', value: 15 },
        { name: '北京', value: 12 },
        { name: '其他', value: 24 }
      ],
      onlineTransactions: [
        { user: '138****1234', time: 1717027200000, action: '下单', product: '平遥牛肉' }
      ],
      offlineTransactions: [
        { user: '139****5678', time: 1717023600000, action: '退货', product: '云冈石窟纪念册' }
      ]
    }
  },
  methods: {
    showNotice() {
      this.showNoticeModal = true
    },
    // 跳转商户后台（hioshop-admin-web）。地址在 .env 的 VITE_MERCHANT_ADMIN_URL 中配置
    gotoAdmin() {
      window.open(import.meta.env.VITE_MERCHANT_ADMIN_URL || 'http://localhost:9528/', '_blank')
    }
  }
}
</script>

<style scoped>
.main-container {
  position: relative;
  height: calc(200vh - 80px);
  background: url('../assets/background.png');
  padding: 20px;
}

.container {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 15px;
  box-sizing: border-box;
}

.container1 {
  top: 20px;
  left: 1%;
  width: 23%;
  height: 25vh;
}

.container2 {
  top: 20px;
  left: 25%;
  width: 48%;
  height: 25vh;
}

.container3 {
  top: 20px;
  right: 1%;
  width: 23%;
  height: 25vh;
}

.container4 {
  top: 28vh;
  left: 1%;
  width: 48%;
  height: 30vh;
}

.container5 {
  top: 60vh;
  left: 1%;
  width: 23%;
  height: 45vh;
}

.container6 {
  top: 60vh;
  left: 25%;
  width: 23%;
  height: 45vh;
}

.container7 {
  top: 110vh;
  left: 1%;
  width: 48%;
  height: 25vh;
}

.container8 {
  top: 28vh;
  right: 50vh;
  width: 23%;
  height: 45vh;
}

.container9 {
  top: 28vh;
  right: 1%;
  width: 23%;
  height: 45vh;
}

.container10 {
  top: 75vh;
  left: 50%;
  width: 48%;
  height: 30vh;
}

.container11 {
  top: 110vh;
  right: 1%;
  width: 48%;
  height: 25vh;
}

.title-box {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 10px;
}

.title-box h3 {
  color: #a8d1ff;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
}

.shop-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
}

.total-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-left: 20px;
}

.total-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 8px;
}

.value {
  font-size: 24px;
  color: #7db2ff;
  display: flex;
  align-items: baseline;
}

.unit {
  font-size: 12px;
  color: #8c9eb5;
  margin-left: 5px;
}

.control-buttons {
  position: absolute;
  top: -7px;
  right: 30px;
  display: flex;
  gap: 15px;
  z-index: 999;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.notice-btn {
  background: linear-gradient(90deg, orange, #ff8c00);
  color: #fff;
}

.admin-btn {
  background: linear-gradient(90deg, #4169e1, #1e90ff);
  color: #fff;
}

.transaction-table {
  height: calc(100% - 40px);
  color: #fff;
}
</style>
