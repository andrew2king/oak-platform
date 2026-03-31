import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/Home.vue') },
  { path: '/category', component: () => import('@/views/Category.vue') },
  { path: '/search', component: () => import('@/views/Search.vue') },
  { path: '/checkout', component: () => import('@/views/Checkout.vue') },
  { path: '/product/:id', component: () => import('@/views/ProductDetail.vue') },
  { path: '/cart', component: () => import('@/views/Cart.vue') },
  { path: '/orders', component: () => import('@/views/Orders.vue') },
  { path: '/member', component: () => import('@/views/Member.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router