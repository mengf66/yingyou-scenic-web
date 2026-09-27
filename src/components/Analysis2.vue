<template>
  <div class="analysis2-container">
    <!-- 左侧：舆情统计概览 -->
    <div class="container container-left">
      <div class="title-box">
        <h3>舆情统计概览</h3>
      </div>
      <div class="stats-container">
        <div v-for="(item, index) in publicOpinionStats" :key="index" class="stat-item">
          <div class="stat-title">{{ item.title }}</div>
          <div class="stat-value">{{ item.value }}</div>
          <div :class="['stat-compare', item.trend]">
            <span class="icon">{{ item.trend === 'up' ? '↑' : '↓' }}</span>
            {{ item.rate }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：热门舆情信息 -->
    <div class="container container-right">
      <div class="title-box">
        <h3>热门舆情信息</h3>
        <button class="wordcloud-btn" @click="showWordCloud">词云分析</button>
      </div>
      <div class="comments-grid">
        <div
            v-for="(comment, index) in hotComments"
            :key="index"
            :class="['comment-card', getCommentColor(index)]"
        >
          <div class="user-info">
            <span class="username">{{ comment.user }}</span>
            <span class="time">{{ comment.time }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 词云弹窗 -->
  <div v-if="showModal" class="modal-mask">
    <div class="modal-content">
      <div class="modal-header">
        <h3>舆情词云分析</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      <div id="wordcloud-chart" style="width: 800px; height: 500px;"></div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

export default {
  setup() {
    // 舆情统计数据
    const publicOpinionStats = ref([
      { title: '今日舆情总数', value: '2,856', trend: 'up', rate: 12 },
      { title: '昨日舆情总数', value: '2,548', trend: 'down', rate: 5 },
      { title: '本周舆情总数', value: '18,942', trend: 'up', rate: 8 },
      { title: '上周舆情总数', value: '17,532', trend: 'down', rate: 3 },
      { title: '本月舆情总数', value: '62,358', trend: 'up', rate: 15 },
      { title: '上月舆情总数', value: '54,210', trend: 'up', rate: 2 }
    ])

    // 热门评论数据
    const hotComments = ref([
      {
        user: '游客_山水之间',
        time: '2小时前',
        content: '五台山的文化底蕴令人震撼，不过景区指示牌可以再完善些，第一次来容易迷路'
      },
      {
        user: '旅行者小王',
        time: '3小时前',
        content: '平遥古城的夜景太美了！建议增加更多传统文化体验项目，会再来！'
      },
      {
        user: '摄影爱好者老张',
        time: '5小时前',
        content: '云冈石窟的保护工作做得很好，但希望开放更多区域给摄影爱好者'
      },
      {
        user: '自驾游达人',
        time: '6小时前',
        content: '壶口瀑布气势磅礴，但周边停车场需要扩建，周末车位紧张'
      },
      {
        user: '文化爱好者',
        time: '8小时前',
        content: '悬空寺的古代建筑智慧让人惊叹，建议增加更多历史讲解服务'
      },
      {
        user: '家庭游客',
        time: '10小时前',
        content: '景区亲子设施很完善，工作人员服务热情，孩子玩得很开心'
      }
    ])

    const showModal = ref(false)
    const chartInstance = ref(null)

    // 词云数据
    const wordCloudData = ref([
      { name: '景区服务', value: 150 },
      { name: '文化体验', value: 135 },
      { name: '旅游设施', value: 128 },
      { name: '文物保护', value: 115 },
      { name: '游客体验', value: 108 },
      { name: '景区管理', value: 102 },
      { name: '自然风光', value: 98 },
      { name: '历史底蕴', value: 95 },
      { name: '导游服务', value: 88 },
      { name: '门票价格', value: 85 },
      { name: '环境卫生', value: 82 },
      { name: '交通便利', value: 78 },
      { name: '特色美食', value: 75 },
      { name: '安全措施', value: 72 },
      { name: '旅游纪念品', value: 68 },
      { name: '智慧旅游', value: 65 },
      { name: '节庆活动', value: 62 },
      { name: '夜间照明', value: 58 },
      { name: '无障碍设施', value: 55 },
      { name: '游客中心', value: 52 }
    ])

    const initWordCloud = () => {
      const chartDom = document.getElementById('wordcloud-chart')
      chartInstance.value = echarts.init(chartDom)
      const option = {
        tooltip: {},
        series: [{
          type: 'wordCloud',
          shape: 'cardioid',
          sizeRange: [10, 10],
          rotationRange: [-45, 45],
          gridSize: 8,
          drawOutOfBound: true,
          textStyle: {
            color: () => {
              return 'rgb(' + [
                Math.round(Math.random() * 160 + 95),
                Math.round(Math.random() * 160 + 95),
                Math.round(Math.random() * 160 + 95)
              ].join(',') + ')'
            }
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: wordCloudData.value.sort((a, b) => b.value - a.value)
        }]
      }
      chartInstance.value.setOption(option)
    }

    const showWordCloud = () => {
      showModal.value = true
      setTimeout(initWordCloud, 0)
    }

    const closeModal = () => {
      showModal.value = false
      if (chartInstance.value) {
        chartInstance.value.dispose()
      }
    }

    return {
      publicOpinionStats,
      hotComments,
      showModal,
      showWordCloud,
      closeModal
    }
  },
  methods: {
    // 评论卡片按 2x2 棋盘格交替蓝/绿
    getCommentColor(index) {
      const row = Math.floor(index / 2)
      const isEven = index % 2 === 0
      return row % 2 === 0 ? (isEven ? 'blue' : 'green') : (isEven ? 'green' : 'blue')
    }
  }
}
</script>

<style scoped>
.analysis2-container {
  display: flex;
  height: calc(90vh - 80px);
  background: url('../assets/background.png');
  padding: 20px;
  gap: 20px;
}

.container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
  box-sizing: border-box;
}

.container-left {
  width: 16.66%;
  min-width: 280px;
}

.container-right {
  width: 83.34%;
}

.title-box {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  position: relative;
}

.title-box h3 {
  color: #7db2ff;
  margin: 0;
  font-size: 16px;
  letter-spacing: 1px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.08);
  padding: 15px;
  border-radius: 6px;
}

.stat-title {
  color: #a8c7ff;
  font-size: 12px;
  margin-bottom: 8px;
}

.stat-value {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-compare {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-compare.up {
  color: #6dd230;
}

.stat-compare.down {
  color: #ff4d4d;
}

.icon {
  font-weight: bold;
}

.comments-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  height: calc(100% - 60px);
}

.comment-card {
  padding: 15px;
  border-radius: 8px;
  min-height: 120px;
}

.comment-card.blue {
  background: linear-gradient(135deg, rgba(42, 91, 172, 0.3), rgba(25, 55, 109, 0.5));
}

.comment-card.green {
  background: linear-gradient(135deg, rgba(63, 159, 117, 0.3), rgba(47, 119, 89, 0.5));
}

.user-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.username {
  color: #7db2ff;
  font-size: 12px;
}

.time {
  color: #8c9eb5;
  font-size: 12px;
}

.comment-content {
  color: #e6f7ff;
  font-size: 14px;
  line-height: 1.4;
}

.wordcloud-btn {
  position: absolute;
  right: 20px;
  top: 0;
  transform: translateY(-50%);
  background: rgba(125, 178, 255, 0.3);
  border: 1px solid #7db2ff;
  color: #7db2ff;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.wordcloud-btn:hover {
  background: rgba(125, 178, 255, 0.5);
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: rgba(14, 32, 62, 0.95);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  color: #7db2ff;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #7db2ff;
  font-size: 24px;
  cursor: pointer;
  padding: 0 10px;
}

.close-btn:hover {
  color: #a8c7ff;
}
</style>
