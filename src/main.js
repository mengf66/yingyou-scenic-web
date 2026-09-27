import './assets/global.css'
import 'element-plus/dist/index.css'
import * as echarts from 'echarts'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import Tmap from '@map-component/vue-tmap'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import shanxiJson from '@/assets/shanxi.json'

// 大数据中心后端地址（接入真实接口时使用），在 .env.local 的 VITE_API_BASE 中配置
axios.defaults.baseURL = import.meta.env.VITE_API_BASE || '/'

// 注册山西省地图（地市级，来源：阿里云 DataV 行政区划数据），供「游客热力分布」等地图组件使用。
// 原代码引用的 assets/china.json 已丢失且并未被任何图表使用，故改为注册山西地图。
echarts.registerMap('山西', shanxiJson)

const app = createApp(App)
app.config.globalProperties.$echarts = echarts
app.use(ElementPlus, { locale: zhCn })
app.use(Tmap)
app.use(router)
app.mount('#app')
