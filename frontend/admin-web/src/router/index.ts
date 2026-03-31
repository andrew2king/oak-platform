import { createRouter, createWebHistory } from 'vue-router'

// 非懒加载方式导入dashboard
import Dashboard from '@/views/dashboard/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { title: '仪表盘' }
  },
  {
    path: '/test',
    component: () => import('@/views/test.vue')
  },
  {
    path: '/product/list',
    component: () => import('@/views/product/list.vue')
  },
  {
    path: '/product/category',
    component: () => import('@/views/product/category.vue')
  },
  {
    path: '/order/list',
    component: () => import('@/views/order/list.vue')
  },
  {
    path: '/inventory/list',
    component: () => import('@/views/inventory/list.vue')
  },
  {
    path: '/inventory/warning',
    component: () => import('@/views/inventory/warning.vue')
  },
  {
    path: '/inventory/transfer',
    component: () => import('@/views/inventory/transfer.vue')
  },
  {
    path: '/member/list',
    component: () => import('@/views/member/list.vue')
  },
  {
    path: '/member/level',
    component: () => import('@/views/member/level.vue')
  },
  {
    path: '/member/points',
    component: () => import('@/views/member/points.vue')
  },
  {
    path: '/member/tags',
    component: () => import('@/views/member/tags.vue')
  },
  {
    path: '/marketing/activity',
    component: () => import('@/views/marketing/activity.vue')
  },
  {
    path: '/marketing/coupon',
    component: () => import('@/views/marketing/coupon.vue')
  },
  {
    path: '/marketing/seckill',
    component: () => import('@/views/marketing/seckill.vue')
  },
  {
    path: '/marketing/groupbuy',
    component: () => import('@/views/marketing/groupbuy.vue')
  },
  {
    path: '/analysis/sales',
    component: () => import('@/views/analysis/sales.vue')
  },
  {
    path: '/analysis/product',
    component: () => import('@/views/analysis/product.vue')
  },
  {
    path: '/analysis/member',
    component: () => import('@/views/analysis/member.vue')
  },
  {
    path: '/system/user',
    component: () => import('@/views/system/user.vue')
  },
  {
    path: '/system/role',
    component: () => import('@/views/system/role.vue')
  },
  {
    path: '/system/store',
    component: () => import('@/views/system/store.vue')
  },
  {
    path: '/system/config',
    component: () => import('@/views/system/config.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router