import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', component: () => import('@/views/Home.vue') },
  { path: '/category', component: () => import('@/views/Category.vue') },
  { path: '/search', component: () => import('@/views/Search.vue') },
  { path: '/product/:id', component: () => import('@/views/ProductDetail.vue') },
  { path: '/login', component: () => import('@/views/Login.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('@/views/Register.vue'), meta: { guest: true } },
  { path: '/forgot-password', component: () => import('@/views/ForgotPassword.vue'), meta: { guest: true } },
  // 需要认证的页面
  { path: '/cart', component: () => import('@/views/Cart.vue'), meta: { requiresAuth: true } },
  { path: '/checkout', component: () => import('@/views/Checkout.vue'), meta: { requiresAuth: true } },
  { path: '/orders', component: () => import('@/views/Orders.vue'), meta: { requiresAuth: true } },
  { path: '/member', component: () => import('@/views/Member.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 需要认证的页面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 仅guest可访问的页面（如登录页，已登录用户不应访问）
  if (to.meta.guest && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router