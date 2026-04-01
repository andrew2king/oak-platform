import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 非懒加载方式导入dashboard
import Dashboard from '@/views/dashboard/index.vue'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true, title: '登录' }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { title: '仪表盘', requiresAuth: true }
  },
  {
    path: '/test',
    component: () => import('@/views/test.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product/list',
    component: () => import('@/views/product/list.vue'),
    meta: { title: '商品管理', requiresAuth: true }
  },
  {
    path: '/product/category',
    component: () => import('@/views/product/category.vue'),
    meta: { title: '分类管理', requiresAuth: true }
  },
  {
    path: '/order/list',
    component: () => import('@/views/order/list.vue'),
    meta: { title: '全部订单', requiresAuth: true }
  },
  {
    path: '/inventory/list',
    component: () => import('@/views/inventory/list.vue'),
    meta: { title: '库存查询', requiresAuth: true }
  },
  {
    path: '/inventory/warning',
    component: () => import('@/views/inventory/warning.vue'),
    meta: { title: '库存预警', requiresAuth: true }
  },
  {
    path: '/inventory/transfer',
    component: () => import('@/views/inventory/transfer.vue'),
    meta: { title: '库存调拨', requiresAuth: true }
  },
  {
    path: '/member/list',
    component: () => import('@/views/member/list.vue'),
    meta: { title: '会员列表', requiresAuth: true }
  },
  {
    path: '/member/level',
    component: () => import('@/views/member/level.vue'),
    meta: { title: '等级管理', requiresAuth: true }
  },
  {
    path: '/member/points',
    component: () => import('@/views/member/points.vue'),
    meta: { title: '积分管理', requiresAuth: true }
  },
  {
    path: '/member/tags',
    component: () => import('@/views/member/tags.vue'),
    meta: { title: '标签管理', requiresAuth: true }
  },
  {
    path: '/marketing/activity',
    component: () => import('@/views/marketing/activity.vue'),
    meta: { title: '活动管理', requiresAuth: true }
  },
  {
    path: '/marketing/coupon',
    component: () => import('@/views/marketing/coupon.vue'),
    meta: { title: '优惠券', requiresAuth: true }
  },
  {
    path: '/marketing/seckill',
    component: () => import('@/views/marketing/seckill.vue'),
    meta: { title: '限时秒杀', requiresAuth: true }
  },
  {
    path: '/marketing/groupbuy',
    component: () => import('@/views/marketing/groupbuy.vue'),
    meta: { title: '拼团活动', requiresAuth: true }
  },
  {
    path: '/analysis/sales',
    component: () => import('@/views/analysis/sales.vue'),
    meta: { title: '销售分析', requiresAuth: true }
  },
  {
    path: '/analysis/product',
    component: () => import('@/views/analysis/product.vue'),
    meta: { title: '商品分析', requiresAuth: true }
  },
  {
    path: '/analysis/member',
    component: () => import('@/views/analysis/member.vue'),
    meta: { title: '会员分析', requiresAuth: true }
  },
  {
    path: '/system/user',
    component: () => import('@/views/system/user.vue'),
    meta: { title: '用户管理', requiresAuth: true }
  },
  {
    path: '/system/role',
    component: () => import('@/views/system/role.vue'),
    meta: { title: '角色权限', requiresAuth: true }
  },
  {
    path: '/system/store',
    component: () => import('@/views/system/store.vue'),
    meta: { title: '门店管理', requiresAuth: true }
  },
  {
    path: '/system/config',
    component: () => import('@/views/system/config.vue'),
    meta: { title: '系统配置', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - admin-web所有页面需要管理员权限
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 登录页不需要认证
  if (to.meta.guest) {
    // 已登录用户访问登录页，跳转到首页
    if (authStore.isAuthenticated && authStore.isAdmin) {
      next('/dashboard')
      return
    }
    next()
    return
  }

  // 其他页面需要管理员认证
  if (!authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (!authStore.isAdmin) {
    // 普通会员无法访问后台
    authStore.logout()
    next({ path: '/login' })
    return
  }

  next()
})

export default router