import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { title: '登录', public: true } },
  { path: '/screen', name: 'screen', component: () => import('@/views/ScreenView.vue'), meta: { title: '数据大屏' } },
  {
    path: '/',
    component: () => import('@/layout/AdminLayout.vue'),
    redirect: '/notice',
    children: [
      { path: 'notice', name: 'notice', component: () => import('@/views/notice/NoticeList.vue'), meta: { title: '发布公告', group: '景区运营' } },
      { path: 'feedback', name: 'feedback', component: () => import('@/views/feedback/FeedbackView.vue'), meta: { title: '接收反馈', group: '反馈与预警' } },
      { path: 'warning', name: 'warning', component: () => import('@/views/feedback/WarningView.vue'), meta: { title: '安全预警', group: '反馈与预警' } },
      { path: 'workorder/create', name: 'workorder-create', component: () => import('@/views/workorder/WorkorderCreate.vue'), meta: { title: '工单创建与分派', group: '工单管理' } },
      { path: 'workorder/track', name: 'workorder-track', component: () => import('@/views/workorder/WorkorderTrack.vue'), meta: { title: '工单流程追踪', group: '工单管理' } },
      { path: 'workorder/stats', name: 'workorder-stats', component: () => import('@/views/workorder/WorkorderStats.vue'), meta: { title: '工单统计与分析', group: '工单管理' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(to => {
  const token = localStorage.getItem('scenic-token')
  if (!to.meta.public && !token) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && token) return { path: '/' }
})

router.afterEach(to => {
  document.title = `${to.meta.title ? to.meta.title + ' - ' : ''}山西智慧旅游大数据中心`
})

export default router
