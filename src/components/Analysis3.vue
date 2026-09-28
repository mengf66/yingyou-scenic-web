<template>
  <div class="screen-grid">
    <!-- 顶部：销售总额 + 线上线下 -->
    <div class="top">
      <ScreenPanel title="线上销售" class="t-side">
        <div class="channel">
          <BaseChart :option="ringOption(68, C.gold)" class="ring" />
          <div class="ch-info">
            <div class="ch-value">68<small>万元</small></div>
            <div class="ch-rate up">▲ 40% 环比</div>
            <div class="ch-desc">小程序商城 · 票务 · 预订</div>
          </div>
        </div>
      </ScreenPanel>

      <ScreenPanel title="平台销售总额" sub="累计 · 元" class="t-mid">
        <template #extra>
          <div class="btns">
            <button class="jbtn" @click="showNoticeModal = true">景区通告</button>
            <button class="jbtn primary" @click="gotoAdmin">商户后台 ↗</button>
          </div>
        </template>
        <div class="amount">
          <template v-for="(d, i) in digits" :key="i">
            <span class="digit">{{ d }}</span>
            <span v-if="i === 1 || i === 4" class="comma">,</span>
          </template>
        </div>
        <div class="amount-sub">
          <span>今日成交 <b>¥{{ todayData.amount }}</b></span>
          <span>今日订单 <b>{{ todayData.count }}</b> 笔</span>
          <span>入驻商户 <b>{{ totalShops.toLocaleString() }}</b> 家</span>
        </div>
      </ScreenPanel>

      <ScreenPanel title="线下销售" class="t-side">
        <div class="channel">
          <BaseChart :option="ringOption(32, C.jade)" class="ring" />
          <div class="ch-info">
            <div class="ch-value">32<small>万元</small></div>
            <div class="ch-rate down">▼ 5% 环比</div>
            <div class="ch-desc">到店核销 · 景区门店</div>
          </div>
        </div>
      </ScreenPanel>
    </div>

    <!-- 中部 -->
    <div class="mid">
      <ScreenPanel title="商户业态" sub="店铺数 · 年营收">
        <div class="shops">
          <div v-for="s in shopData" :key="s.label" class="shop" :style="{ '--c': s.color }">
            <div class="shop-name">{{ s.label }}</div>
            <div class="shop-num">{{ s.value }}<small>家</small></div>
            <div class="shop-bar"><i :style="{ width: (s.value / maxShop) * 100 + '%' }"></i></div>
            <div class="shop-rev">营收 {{ s.revenue.toLocaleString() }} 万元</div>
          </div>
        </div>
      </ScreenPanel>
      <ScreenPanel title="商户销售排行" sub="单位：万元">
        <BaseChart :option="rankOption" />
      </ScreenPanel>
      <ScreenPanel title="成交分类">
        <BaseChart :option="categoryOption" />
      </ScreenPanel>
      <ScreenPanel title="今日成交趋势" sub="按时段 · 笔">
        <BaseChart :option="trendOption" />
      </ScreenPanel>
    </div>

    <!-- 底部 -->
    <div class="bottom">
      <ScreenPanel title="游客来源分布" sub="省份占比">
        <BaseChart :option="sourceOption" />
      </ScreenPanel>
      <ScreenPanel title="实时交易" sub="线上 + 线下">
        <div class="tx">
          <div class="tx-head"><span>用户</span><span>时间</span><span>渠道</span><span>操作</span><span>商品</span><span>金额</span></div>
          <div class="tx-body">
            <div v-for="(t, i) in transactions" :key="i" class="tx-row">
              <span>{{ t.user }}</span>
              <span>{{ fmtTime(t.time) }}</span>
              <span :class="['tag', t.channel === '线上' ? 'on' : 'off']">{{ t.channel }}</span>
              <span :class="['act', t.action === '退货' ? 'refund' : '']">{{ t.action }}</span>
              <span class="prod">{{ t.product }}</span>
              <span class="money">{{ t.action === '退货' ? '-' : '' }}¥{{ t.amount }}</span>
            </div>
          </div>
        </div>
      </ScreenPanel>
    </div>

    <NoticeModal v-if="showNoticeModal" @close="showNoticeModal = false" />
  </div>
</template>

<script>
import BaseChart from './BaseChart.vue'
import NoticeModal from './NoticeModal.vue'
import ScreenPanel from './screen/ScreenPanel.vue'
import { C, PALETTE, axis, tooltip, legend, goldBar } from './screen/theme'

export default {
  components: { BaseChart, NoticeModal, ScreenPanel },
  data() {
    return {
      C,
      showNoticeModal: false,
      totalSales: 24960000,
      shopData: [
        { value: 560, revenue: 1200, color: '#d9b36a', label: '酒店民宿' },
        { value: 420, revenue: 860, color: '#d9604c', label: '特色餐饮' },
        { value: 265, revenue: 450, color: '#5fb3a1', label: '旅拍文创' }
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
      // 原先线上、线下各只有一条记录，这里补充为滚动的实时流水示例
      transactions: [
        { user: '138****1234', time: Date.now() - 60000, channel: '线上', action: '下单', product: '平遥牛肉礼盒', amount: 168 },
        { user: '139****5678', time: Date.now() - 180000, channel: '线下', action: '退货', product: '云冈石窟纪念册', amount: 58 },
        { user: '186****2210', time: Date.now() - 320000, channel: '线上', action: '下单', product: '平遥古城通票', amount: 125 },
        { user: '155****9087', time: Date.now() - 460000, channel: '线下', action: '核销', product: '推光漆器体验课', amount: 198 },
        { user: '137****4532', time: Date.now() - 610000, channel: '线上', action: '下单', product: '日升昌票号文创书签', amount: 36 },
        { user: '159****7765', time: Date.now() - 780000, channel: '线上', action: '下单', product: '古韵民宿·大床房', amount: 388 },
        { user: '188****3301', time: Date.now() - 960000, channel: '线下', action: '核销', product: '碗托食礼盒', amount: 79 },
        { user: '133****6620', time: Date.now() - 1150000, channel: '线上', action: '下单', product: '山西老陈醋礼装', amount: 96 }
      ]
    }
  },
  computed: {
    digits() {
      return String(this.totalSales).padStart(8, '0').split('')
    },
    totalShops() {
      return this.shopData.reduce((s, x) => s + x.value, 0)
    },
    maxShop() {
      return Math.max(...this.shopData.map(x => x.value))
    },
    rankOption() {
      return {
        tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => v + ' 万元' }),
        grid: { top: 4, bottom: 4, left: 4, right: 40, containLabel: true },
        xAxis: { type: 'value', show: false },
        yAxis: axis({ type: 'category', inverse: true, data: this.salesRankData.map(i => i.name), axisLine: { show: false }, axisLabel: { color: C.text, fontSize: 11 } }),
        series: [{
          type: 'bar',
          barWidth: 8,
          showBackground: true,
          backgroundStyle: { color: 'rgba(217,179,106,0.07)', borderRadius: 4 },
          label: { show: true, position: 'right', color: C.goldLight, fontSize: 11 },
          data: this.salesRankData.map((d, i) => ({ value: d.value, itemStyle: { color: i < 3 ? goldBar() : 'rgba(111,159,216,0.7)', borderRadius: 4 } }))
        }]
      }
    },
    categoryOption() {
      return {
        color: PALETTE,
        tooltip: tooltip({ trigger: 'item', formatter: '{b}：{d}%' }),
        legend: legend({ bottom: 0, left: 'center' }),
        series: [{
          type: 'pie',
          roseType: 'radius',
          radius: ['18%', '66%'],
          center: ['50%', '44%'],
          label: { color: C.text, fontSize: 11, formatter: '{b}\n{d}%' },
          labelLine: { length: 6, length2: 6, lineStyle: { color: 'rgba(217,179,106,0.5)' } },
          itemStyle: { borderColor: '#101d3f', borderWidth: 2, borderRadius: 3 },
          data: this.categoryData
        }]
      }
    },
    trendOption() {
      return {
        tooltip: tooltip({ trigger: 'axis' }),
        grid: { top: 16, bottom: 4, left: 4, right: 12, containLabel: true },
        xAxis: axis({ type: 'category', boundaryGap: false, data: this.trendData.xAxis }),
        yAxis: axis({ type: 'value', axisLine: { show: false } }),
        series: [{
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: this.trendData.values,
          lineStyle: { color: C.gold, width: 2.5 },
          itemStyle: { color: C.goldLight, borderColor: C.gold, borderWidth: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(217,179,106,0.4)' }, { offset: 1, color: 'rgba(217,179,106,0)' }] } },
          markPoint: {
            symbol: 'pin', symbolSize: 36,
            itemStyle: { color: C.cinnabar },
            label: { color: '#fff', fontSize: 10 },
            data: [{ type: 'max', name: '峰值' }]
          }
        }]
      }
    },
    sourceOption() {
      return {
        tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => v + '%' }),
        grid: { top: 16, bottom: 4, left: 4, right: 8, containLabel: true },
        xAxis: axis({ type: 'category', data: this.sourceData.map(s => s.name), axisLabel: { color: C.text, fontSize: 12 } }),
        yAxis: axis({ type: 'value', axisLine: { show: false }, axisLabel: { color: C.text2, formatter: '{value}%' } }),
        series: [{
          type: 'bar',
          barWidth: 18,
          label: { show: true, position: 'top', color: C.goldLight, formatter: '{c}%' },
          data: this.sourceData.map((s, i) => ({ value: s.value, itemStyle: { color: i === 0 ? goldBar(false) : 'rgba(111,159,216,0.65)', borderRadius: [3, 3, 0, 0] } }))
        }]
      }
    }
  },
  methods: {
    ringOption(value, color) {
      return {
        series: [{
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          radius: '90%',
          pointer: { show: false },
          progress: { show: true, roundCap: true, width: 9, itemStyle: { color } },
          axisLine: { lineStyle: { width: 9, color: [[1, 'rgba(217,179,106,0.1)']] } },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          detail: { offsetCenter: [0, 0], formatter: '{value}%', color: C.text, fontSize: 18, fontWeight: 600 },
          data: [{ value }]
        }]
      }
    },
    fmtTime(t) {
      const d = new Date(t)
      const p = n => String(n).padStart(2, '0')
      return `${p(d.getHours())}:${p(d.getMinutes())}`
    },
    // 跳转商户后台（hioshop-admin-web）。地址在 .env 的 VITE_MERCHANT_ADMIN_URL 中配置
    gotoAdmin() {
      window.open(import.meta.env.VITE_MERCHANT_ADMIN_URL || 'http://localhost:9528/', '_blank')
    }
  }
}
</script>

<style scoped>
.screen-grid {
  display: grid;
  grid-template-rows: 1fr 1.7fr 1.35fr;
  gap: 14px;
  height: 100%;
  min-height: 0;
}
.top {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 14px;
  min-height: 0;
}
.mid {
  display: grid;
  grid-template-columns: 1fr 1.25fr 1fr 1.25fr;
  gap: 14px;
  min-height: 0;
}
.bottom {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 14px;
  min-height: 0;
}

/* 线上 / 线下 */
.channel {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 8px;
}
.ring {
  width: 46%;
  height: 100%;
}
.ch-value {
  font-family: var(--font-num);
  font-size: 30px;
  font-weight: 600;
  color: var(--jin-light);
}
.ch-value small {
  margin-left: 4px;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: normal;
  color: var(--screen-text-2);
}
.ch-rate {
  margin: 2px 0 6px;
  font-size: 12px;
}
.ch-rate.up { color: #e07a64; }
.ch-rate.down { color: #5fb3a1; }
.ch-desc {
  font-size: 11px;
  line-height: 1.5;
  color: var(--screen-text-2);
}

/* 销售总额 */
.btns {
  display: flex;
  gap: 8px;
}
.jbtn {
  padding: 3px 12px;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--jin-light);
  background: transparent;
  border: 1px solid rgba(217, 179, 106, 0.5);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
}
.jbtn:hover {
  background: rgba(217, 179, 106, 0.12);
}
.jbtn.primary {
  color: #fff;
  background: linear-gradient(180deg, #c9483a, #9c3027);
  border-color: #d9604c;
}
.amount {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 6px;
  margin-top: 6px;
}
.digit {
  display: inline-grid;
  place-items: center;
  width: 46px;
  height: 60px;
  font-family: var(--font-num);
  font-size: 40px;
  font-weight: 700;
  color: var(--jin-light);
  text-shadow: 0 0 14px rgba(217, 179, 106, 0.6);
  background: linear-gradient(180deg, rgba(217, 179, 106, 0.16), rgba(217, 179, 106, 0.03));
  border: 1px solid rgba(217, 179, 106, 0.4);
  border-radius: 2px;
}
.comma {
  font-size: 32px;
  color: var(--jin);
  line-height: 1;
}
.amount-sub {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--screen-text-2);
}
.amount-sub b {
  font-family: var(--font-num);
  font-size: 16px;
  color: var(--screen-text);
  margin: 0 2px;
}

/* 商户业态 */
.shops {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
}
.shop {
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: 4px;
}
.shop-name {
  font-size: 13px;
  color: var(--screen-text);
}
.shop-num {
  font-family: var(--font-num);
  font-size: 20px;
  font-weight: 600;
  color: var(--c);
  text-align: right;
}
.shop-num small {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: normal;
  color: var(--screen-text-2);
  margin-left: 2px;
}
.shop-bar {
  grid-column: span 2;
  height: 8px;
  border-radius: 3px;
  background: rgba(217, 179, 106, 0.08);
  overflow: hidden;
}
.shop-bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--c);
}
.shop-rev {
  grid-column: span 2;
  font-size: 11px;
  color: var(--screen-text-2);
}

/* 实时交易 */
.tx {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 12px;
}
.tx-head,
.tx-row {
  display: grid;
  grid-template-columns: 1.1fr 0.6fr 0.6fr 0.6fr 1.8fr 0.8fr;
  align-items: center;
  padding: 0 10px;
}
.tx-head {
  flex-shrink: 0;
  height: 30px;
  color: var(--jin);
  background: rgba(217, 179, 106, 0.08);
  border-bottom: 1px solid rgba(217, 179, 106, 0.3);
}
.tx-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.tx-row {
  height: 30px;
  color: var(--screen-text);
  border-bottom: 1px dashed rgba(217, 179, 106, 0.1);
}
.tx-row:nth-child(odd) {
  background: rgba(255, 255, 255, 0.015);
}
.tag {
  justify-self: start;
  padding: 0 6px;
  font-size: 11px;
  line-height: 18px;
  border-radius: 2px;
}
.tag.on { color: #e8cf94; border: 1px solid rgba(232, 207, 148, 0.5); }
.tag.off { color: #5fb3a1; border: 1px solid rgba(95, 179, 161, 0.5); }
.act.refund { color: #e07a64; }
.prod {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.money {
  text-align: right;
  font-family: var(--font-num);
  color: var(--jin-light);
}
</style>
